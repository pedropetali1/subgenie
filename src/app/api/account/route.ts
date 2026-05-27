import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Cancela assinatura Stripe se existir
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, plan')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id && profile.plan === 'premium') {
    try {
      const stripe = getStripe();
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
        limit: 10,
      });
      for (const sub of subs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    } catch (err) {
      console.error('[delete account] erro cancelando Stripe', err);
    }
  }

  // Deletar usuário em auth.users → cascateia profiles, subscriptions, notification_log
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Limpa cookies da sessão atual
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
