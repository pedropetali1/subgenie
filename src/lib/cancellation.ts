import type { BillingSource, Subscription } from '@/types';

export interface BillingSourceInfo {
  value: BillingSource;
  label: string;
  emoji: string;
}

export const BILLING_SOURCES: BillingSourceInfo[] = [
  { value: 'web', label: 'Site / Web', emoji: '🌐' },
  { value: 'apple', label: 'App Store (Apple)', emoji: '' },
  { value: 'google', label: 'Google Play', emoji: '▶️' },
  { value: 'other', label: 'Outro', emoji: '📦' },
];

export const BILLING_SOURCE_MAP: Record<BillingSource, BillingSourceInfo> =
  BILLING_SOURCES.reduce(
    (acc, s) => {
      acc[s.value] = s;
      return acc;
    },
    {} as Record<BillingSource, BillingSourceInfo>,
  );

const APPLE_SUBS_URL = 'https://apps.apple.com/account/subscriptions';
const GOOGLE_SUBS_URL = 'https://play.google.com/store/account/subscriptions';

export interface CancellationTarget {
  source: BillingSource;
  /** URL pra onde mandar o usuário. Null quando não há (web sem cancel_url). */
  url: string | null;
  /** Texto do botão/ação. */
  label: string;
  /** Dica curta de uma linha sobre o que vai acontecer. */
  hint: string;
  /** Indica se o link abre uma loja externa (Apple/Google). */
  external: boolean;
}

export function getCancellationTarget(
  sub: Pick<Subscription, 'billing_source' | 'cancel_url' | 'name'>,
): CancellationTarget {
  switch (sub.billing_source) {
    case 'apple':
      return {
        source: 'apple',
        url: APPLE_SUBS_URL,
        label: 'Gerenciar na App Store',
        hint: 'Cobranças pela Apple só podem ser canceladas em Ajustes → seu nome → Assinaturas (ou na App Store).',
        external: true,
      };
    case 'google':
      return {
        source: 'google',
        url: GOOGLE_SUBS_URL,
        label: 'Gerenciar no Google Play',
        hint: 'Cobranças pelo Google Play são canceladas em Play Store → Pagamentos e assinaturas.',
        external: true,
      };
    case 'web':
    case 'other':
    default: {
      const url = sub.cancel_url || null;
      return {
        source: sub.billing_source,
        url,
        label: url ? 'Ir pra página de cancelamento' : 'Sem link de cancelamento',
        hint: url
          ? `Você será levado ao site oficial pra cancelar ${sub.name}.`
          : 'Adicione a URL de cancelamento pra ter o atalho aqui.',
        external: !!url,
      };
    }
  }
}
