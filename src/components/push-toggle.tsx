'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  initialEnabled: boolean;
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushToggle({ initialEnabled }: Props) {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
  }, []);

  async function enable() {
    setError(null);
    if (!publicKey) {
      setError('VAPID public key não configurada (NEXT_PUBLIC_VAPID_PUBLIC_KEY).');
      return;
    }
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setError('Permissão de notificações negada.');
        return;
      }
      const reg =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register('/sw.js'));
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar inscrição');
        return;
      }
      setEnabled(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao ativar push');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch(
          `/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`,
          { method: 'DELETE' },
        );
        await sub.unsubscribe();
      } else {
        await fetch(`/api/push/subscribe?endpoint=null`, { method: 'DELETE' });
      }
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-xs text-text-secondary">
        Notificações push não suportadas neste navegador.
      </p>
    );
  }

  return (
    <div>
      {enabled ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={disable}
          disabled={busy}
        >
          {busy ? 'Desativando...' : 'Desativar notificações push'}
        </Button>
      ) : (
        <Button size="sm" onClick={enable} disabled={busy}>
          {busy ? 'Ativando...' : 'Ativar notificações push'}
        </Button>
      )}
      {error && (
        <p className="mt-2 rounded-input border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
