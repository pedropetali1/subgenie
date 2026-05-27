import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { FROM_EMAIL, getResend } from '@/lib/resend';
import { buildAlertEmailHtml, buildAlertEmailSubject } from '@/lib/email-templates';
import { sendPush } from '@/lib/web-push';
import { calculateNextBilling, daysUntil, formatCurrency, toISODate } from '@/lib/utils';
import type { Profile, Subscription } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Proteção: header `Authorization: Bearer <CRON_SECRET>` (Vercel Cron envia automaticamente)
  const auth = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const todayIso = toISODate(new Date());

  // 1) Buscar perfis com algum canal de notificação ativo
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select(
      'id, email, name, notification_days_before, notification_email, notification_push',
    )
    .or('notification_email.eq.true,notification_push.eq.true');

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  const stats = {
    processed: 0,
    emailsSent: 0,
    pushesSent: 0,
    skipped: 0,
    errors: 0,
    recalculated: 0,
  };

  for (const profile of (profiles ?? []) as Pick<
    Profile,
    | 'id'
    | 'email'
    | 'name'
    | 'notification_days_before'
    | 'notification_email'
    | 'notification_push'
  >[]) {
    // 2) Buscar assinaturas ativas do usuário
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    for (const sub of (subs ?? []) as Subscription[]) {
      stats.processed++;
      const days = daysUntil(sub.next_billing_date);

      // 2a) Recalcular se a data já passou
      if (days < 0) {
        const newDate = toISODate(
          calculateNextBilling(sub.start_date, sub.cycle),
        );
        await supabase
          .from('subscriptions')
          .update({ next_billing_date: newDate })
          .eq('id', sub.id);
        stats.recalculated++;
        continue;
      }

      // 2b) Só notifica se dentro do range configurado
      const window = profile.notification_days_before;
      if (days < 0 || days > window) {
        stats.skipped++;
        continue;
      }

      // 3) E-mail
      if (profile.notification_email) {
        const { data: existing } = await supabase
          .from('notification_log')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('billing_date', sub.next_billing_date)
          .eq('type', 'email')
          .maybeSingle();

        if (existing) {
          stats.skipped++;
        } else {
          try {
            const subject = buildAlertEmailSubject({
              serviceName: sub.name,
              price: Number(sub.price),
              currency: sub.currency,
              daysUntil: days,
            });
            const html = buildAlertEmailHtml({
              userName: profile.name,
              serviceName: sub.name,
              price: Number(sub.price),
              currency: sub.currency,
              billingDate: sub.next_billing_date,
              daysUntil: days,
              category: sub.category,
              cycle: sub.cycle,
              cancelUrl: sub.cancel_url,
              appUrl,
            });

            const resend = getResend();
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject,
              html,
            });

            await supabase.from('notification_log').insert({
              user_id: profile.id,
              subscription_id: sub.id,
              type: 'email',
              billing_date: sub.next_billing_date,
            });

            stats.emailsSent++;
          } catch (err) {
            stats.errors++;
            console.error('[cron/notify] erro ao enviar e-mail', {
              subscription_id: sub.id,
              error: err instanceof Error ? err.message : err,
            });
          }
        }
      }

      // 4) Push
      if (profile.notification_push) {
        const { data: existingPush } = await supabase
          .from('notification_log')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('billing_date', sub.next_billing_date)
          .eq('type', 'push')
          .maybeSingle();

        if (existingPush) {
          stats.skipped++;
        } else {
          const { data: pushSubs } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .eq('user_id', profile.id);

          const targets = pushSubs ?? [];
          if (targets.length > 0) {
            const value = formatCurrency(Number(sub.price), sub.currency);
            const dayLabel =
              days === 0
                ? 'hoje'
                : days === 1
                  ? 'amanhã'
                  : `em ${days} dias`;
            const payload = {
              title: `${sub.name} cobra ${value}`,
              body: `Cobrança ${dayLabel}.`,
              url: '/dashboard',
              tag: `bill-${sub.id}-${sub.next_billing_date}`,
            };
            let anySent = false;
            for (const t of targets) {
              try {
                await sendPush(t, payload);
                anySent = true;
              } catch (err) {
                const statusCode = (err as { statusCode?: number }).statusCode;
                if (statusCode === 404 || statusCode === 410) {
                  // Endpoint expirou → limpa
                  await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', t.endpoint);
                } else {
                  stats.errors++;
                  console.error('[cron/notify] erro push', err);
                }
              }
            }
            if (anySent) {
              await supabase.from('notification_log').insert({
                user_id: profile.id,
                subscription_id: sub.id,
                type: 'push',
                billing_date: sub.next_billing_date,
              });
              stats.pushesSent++;
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, today: todayIso, stats });
}
