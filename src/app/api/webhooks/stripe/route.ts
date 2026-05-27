import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { FROM_EMAIL, getResend } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: 'Webhook não configurado' },
      { status: 400 },
    );
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('[stripe webhook] assinatura inválida', err);
    return NextResponse.json(
      { error: 'Assinatura inválida' },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        const userId = session.metadata?.user_id;
        if (customerId && userId) {
          await supabase
            .from('profiles')
            .update({ plan: 'premium', stripe_customer_id: customerId })
            .eq('id', userId);
        } else if (customerId) {
          await supabase
            .from('profiles')
            .update({ plan: 'premium' })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;
        if (customerId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, name')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

          if (profile?.email) {
            try {
              const resend = getResend();
              await resend.emails.send({
                from: FROM_EMAIL,
                to: profile.email,
                subject: '⚠️ Falha no pagamento do Subsly Premium',
                html: paymentFailedEmail({
                  name: profile.name,
                  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
                }),
              });
            } catch (err) {
              console.error('[stripe webhook] resend falhou', err);
            }
          }
        }
        break;
      }

      default:
        // Ignora outros eventos
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] erro processando', event.type, err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function paymentFailedEmail(input: { name: string | null; appUrl: string }) {
  const greeting = input.name ? `Olá, ${input.name}!` : 'Olá!';
  return `<!DOCTYPE html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#0a0a14;color:#e0e0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" style="background:#0a0a14;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" style="max-width:560px;background:#16162a;border:1px solid #2a2a3a;border-radius:12px;">
<tr><td style="padding:28px;">
<p style="color:#8888a0;font-size:14px;margin:0 0 8px;">${greeting}</p>
<h1 style="color:#e0e0e8;font-size:22px;margin:0 0 16px;">Não conseguimos cobrar seu plano Premium</h1>
<p style="color:#e0e0e8;font-size:15px;line-height:1.5;">Houve uma falha no pagamento da sua assinatura do Subsly Premium. Atualize seu método de pagamento pra continuar com os benefícios.</p>
<div style="margin:24px 0;">
<a href="${input.appUrl}/settings" style="display:inline-block;background:#6C5CE7;color:#fff;text-decoration:none;font-weight:500;padding:12px 20px;border-radius:8px;font-size:14px;">Atualizar pagamento</a>
</div>
</td></tr></table></td></tr></table></body></html>`;
}
