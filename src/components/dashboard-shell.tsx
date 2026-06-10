'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

interface DashboardShellProps {
  profile: Profile;
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '📊' },
  { href: '/subscriptions', label: 'Assinaturas', icon: '📋' },
  { href: '/insights', label: 'Insights', icon: '💡' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-primary px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-input bg-accent text-sm font-bold text-white">
            S
          </div>
          <span className="font-bold text-text-primary">SubGenie</span>
        </Link>
        <button
          aria-label="Menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-input p-2 text-text-secondary hover:bg-bg-card"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-bg-primary p-4 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Link
            href="/dashboard"
            className="mb-8 hidden items-center gap-2 px-2 md:flex"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-input bg-accent text-white font-bold">
              S
            </div>
            <span className="text-lg font-bold text-text-primary">SubGenie</span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-input px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-bg-card text-text-primary'
                      : 'text-text-secondary hover:bg-bg-card hover:text-text-primary',
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-x-4 bottom-4 border-t border-border pt-4">
            {profile.plan !== 'premium' && (
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="mb-3 block rounded-input border border-accent/30 bg-accent/10 px-3 py-2 text-center text-xs font-medium text-accent hover:bg-accent/20"
              >
                ⚡ Conhecer Premium
              </Link>
            )}
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                {(profile.name || profile.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {profile.name || profile.email}
                </p>
                <p className="text-xs text-text-secondary">
                  Plano {profile.plan === 'premium' ? 'Premium ⚡' : 'Free'}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full rounded-input px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary"
            >
              Sair
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-10 bg-black/50 md:hidden"
          />
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
