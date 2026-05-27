import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validations';
import { maxNotificationDaysFor } from '@/lib/plan';
import type { Plan } from '@/types';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
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

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validação falhou', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Enforça limite de dias por plano
  if (parsed.data.notification_days_before !== undefined) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    const plan = (profile?.plan ?? 'free') as Plan;
    const max = maxNotificationDaysFor(plan);
    if (parsed.data.notification_days_before > max) {
      return NextResponse.json(
        {
          error: `No plano ${plan === 'free' ? 'Free' : 'Premium'}, o alerta máximo é ${max} dia(s) antes.`,
        },
        { status: 403 },
      );
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
