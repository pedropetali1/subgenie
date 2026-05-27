import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard-shell';
import { InstallPrompt } from '@/components/install-prompt';
import type { Profile } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Fallback caso o trigger de signup não tenha rodado.
  let resolved: Profile;
  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? '',
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          null,
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) || null,
      })
      .select('*')
      .single();
    resolved = created as Profile;
  } else {
    resolved = profile as Profile;
  }

  return (
    <DashboardShell profile={resolved}>
      {children}
      <InstallPrompt />
    </DashboardShell>
  );
}
