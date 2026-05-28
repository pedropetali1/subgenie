import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subscriptionSchema } from '@/lib/validations';
import { calculateNextBilling, toISODate } from '@/lib/utils';

interface Ctx {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ subscription: data });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
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

  const input = parsed.data;
  const nextBilling = toISODate(
    calculateNextBilling(input.start_date, input.cycle),
  );

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
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
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
