import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subscriptionSchema } from '@/lib/validations';
import { calculateNextBilling, toISODate } from '@/lib/utils';
import { FREE_LIMITS } from '@/lib/constants';
import { canAddSubscription } from '@/lib/plan';
import type { Plan } from '@/types';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('next_billing_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscriptions: data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validação falhou', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Free plan limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  const plan = (profile?.plan ?? 'free') as Plan;
  const { count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true });
  if (!canAddSubscription(plan, count ?? 0)) {
    return NextResponse.json(
      {
        error: `Limite do plano Free atingido (${FREE_LIMITS.maxSubscriptions} assinaturas). Faça upgrade pra Premium.`,
      },
      { status: 403 },
    );
  }

  const input = parsed.data;
  const nextBilling = toISODate(
    calculateNextBilling(input.start_date, input.cycle),
  );

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      name: input.name,
      price: input.price,
      cycle: input.cycle,
      category: input.category,
      start_date: input.start_date,
      next_billing_date: nextBilling,
      notes: input.notes || null,
      cancel_url: input.cancel_url || null,
      is_active: input.is_active ?? true,
      shared_count: input.shared_count ?? 1,
      billing_source: input.billing_source ?? 'web',
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data }, { status: 201 });
}
