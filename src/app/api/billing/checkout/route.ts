import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PREMIUM_PRICE_ID, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!PREMIUM_PRICE_ID) {
    return NextResponse.json(
      { error: 'STRIPE_PRICE_ID não configurado' },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const stripe = getStripe();

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('id', user.id)
    .single();

  // Cria customer só se ainda não existe
  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/settings?upgrade=success`,
    cancel_url: `${appUrl}/settings?upgrade=cancel`,
    allow_promotion_codes: true,
    metadata: { user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
