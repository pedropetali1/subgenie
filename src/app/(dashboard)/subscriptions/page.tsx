import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionsClient } from './subscriptions-client';
import type { Plan } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Assinaturas' };

export default async function SubscriptionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('plan').eq('id', user.id).single()
    : { data: null };
  const plan = (profile?.plan ?? 'free') as Plan;

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={
          <div className="h-32 animate-pulse rounded-card border border-border bg-bg-card" />
        }
      >
        <SubscriptionsClient plan={plan} />
      </Suspense>
    </div>
  );
}
