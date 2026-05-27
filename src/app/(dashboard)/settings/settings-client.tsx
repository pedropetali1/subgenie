'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PushToggle } from '@/components/push-toggle';
import { useLocale, useTheme } from '@/components/providers';
import { createClient } from '@/lib/supabase/client';
import { notificationDayOptionsFor } from '@/lib/plan';
import type { Locale, Profile, Theme } from '@/types';

interface Props {
  profile: Profile;
}

export function SettingsClient({ profile }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const search = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  const [name, setName] = useState(profile.name ?? '');
  const [days, setDays] = useState(profile.notification_days_before);
  const [emailOn, setEmailOn] = useState(profile.notification_email);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPremium = profile.plan === 'premium';
  const dayOptions = notificationDayOptionsFor(profile.plan);

  useEffect(() => {
    const u = search.get('upgrade');
    if (u === 'success') {
      setSavedMsg('Upgrade concluído! Pode levar alguns segundos pra refletir.');
      router.replace('/settings');
      router.refresh();
    } else if (u === 'cancel') {
      setError('Upgrade cancelado.');
      router.replace('/settings');
    }
  }, [search, router]);

  async function persistProfile(patch: Partial<Profile>) {
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          notification_days_before: days,
          notification_email: emailOn,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar');
        return;
      }
      setSavedMsg('Preferências salvas.');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function changeTheme(next: Theme) {
    setTheme(next);
    persistProfile({ theme: next });
  }

  function changeLocale(next: Locale) {
    setLocale(next);
    persistProfile({ locale: next });
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao iniciar upgrade');
        return;
      }
      window.location.href = data.url;
    } finally {
      setUpgrading(false);
    }
  }

  async function handlePortal() {
    setOpeningPortal(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao abrir portal');
        return;
      }
      window.location.href = data.url;
    } finally {
      setOpeningPortal(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao excluir conta');
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <Badge variant={isPremium ? 'accent' : 'default'}>
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
        </CardHeader>
        {isPremium ? (
          <>
            <p className="mb-4 text-sm text-text-secondary">
              Você está no Premium. Gerencie cartão, faturas e cancelamento no
              portal seguro do Stripe.
            </p>
            <Button
              variant="secondary"
              onClick={handlePortal}
              disabled={openingPortal}
            >
              {openingPortal ? 'Abrindo...' : 'Gerenciar assinatura'}
            </Button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-secondary">
              Faça upgrade pra Premium e tenha assinaturas ilimitadas, alertas
              em 1/3/7 dias antes, insights completos e exportação CSV.
            </p>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold text-text-primary">
                R$ 9,90
              </span>
              <span className="text-sm text-text-secondary">/mês</span>
            </div>
            <Button onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? 'Redirecionando...' : 'Fazer upgrade pra Premium'}
            </Button>
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">{t('settings.theme')}</Label>
            <Select
              id="theme"
              value={theme}
              onChange={(e) => changeTheme(e.target.value as Theme)}
            >
              <option value="dark">{t('settings.theme.dark')}</option>
              <option value="light">{t('settings.theme.light')}</option>
              <option value="system">{t('settings.theme.system')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="locale">{t('settings.language')}</Label>
            <Select
              id="locale"
              value={locale}
              onChange={(e) => changeLocale(e.target.value as Locale)}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en">English</option>
            </Select>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Perfil e notificações</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="mt-1 text-xs text-text-secondary">
                E-mail vem do seu provedor de login e não pode ser alterado.
              </p>
            </div>

            <div>
              <Label htmlFor="days">Avisar com antecedência de</Label>
              <Select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d} dia{d > 1 ? 's' : ''} antes
                  </option>
                ))}
              </Select>
              {!isPremium && (
                <p className="mt-1 text-xs text-text-secondary">
                  Premium permite 1, 3 ou 7 dias.
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={emailOn}
                onChange={(e) => setEmailOn(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-bg-input"
              />
              Receber alertas por e-mail
            </label>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-text-primary">
                {t('settings.push')}
              </p>
              <PushToggle initialEnabled={profile.notification_push} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : t('common.save')}
            </Button>
            {savedMsg && (
              <span className="text-sm text-success">{savedMsg}</span>
            )}
          </div>
        </Card>
      </form>

      {error && (
        <p className="rounded-input border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Zona de perigo</CardTitle>
        </CardHeader>
        {!confirmDelete ? (
          <>
            <p className="mb-4 text-sm text-text-secondary">
              Excluir sua conta apaga seu perfil, todas as assinaturas
              cadastradas e logs de notificação. Não tem como desfazer.
            </p>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Excluir minha conta
            </Button>
          </>
        ) : (
          <div className="rounded-input border border-danger/30 bg-danger/10 p-4">
            <p className="mb-3 text-sm text-danger font-medium">
              Tem certeza? Vamos cancelar sua assinatura Premium (se houver) e
              apagar tudo.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir conta'}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
