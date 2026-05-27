import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';
import type { Profile } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Configurações' };

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-text-primary md:text-3xl">
        Configurações
      </h1>
      <p className="mb-8 text-sm text-text-secondary">
        Gerencie seu perfil, plano e alertas.
      </p>
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-card border border-border bg-bg-card" />
        }
      >
        <SettingsClient profile={profile as Profile} />
      </Suspense>
    </div>
  );
}
