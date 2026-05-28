import type { BillingSource, Category, Cycle } from '@/types';

export interface CatalogService {
  name: string;
  category: Category;
  suggestedPrice: number;
  suggestedCycle: Cycle;
  cancelUrl?: string;
  /** Origem de cobrança mais comum. Default 'web' quando ausente. */
  billingSource?: BillingSource;
}

// NOTA: páginas de cancelamento mudam com o tempo. Revise periodicamente.
// Serviços cobrados via Apple/Google não têm cancelUrl: o cancelamento
// acontece nas lojas (resolvido por billing_source + getCancellationTarget).

/** Catálogo de serviços populares no Brasil. */
export const SERVICE_CATALOG: CatalogService[] = [
  // Streaming
  { name: 'Netflix', category: 'streaming', suggestedPrice: 39.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.netflix.com/cancelplan' },
  { name: 'Netflix Premium', category: 'streaming', suggestedPrice: 55.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.netflix.com/cancelplan' },
  { name: 'Disney+', category: 'streaming', suggestedPrice: 33.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.disneyplus.com/account/subscription' },
  { name: 'Max', category: 'streaming', suggestedPrice: 34.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.max.com/account' },
  { name: 'Prime Video', category: 'streaming', suggestedPrice: 14.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.amazon.com.br/gp/primecentral' },
  { name: 'Globoplay', category: 'streaming', suggestedPrice: 24.9, suggestedCycle: 'monthly', cancelUrl: 'https://globoplay.globo.com/configuracoes/assinatura/' },
  { name: 'Paramount+', category: 'streaming', suggestedPrice: 19.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.paramountplus.com/br/account/' },
  { name: 'Apple TV+', category: 'streaming', suggestedPrice: 14.9, suggestedCycle: 'monthly', billingSource: 'apple' },
  { name: 'Crunchyroll', category: 'streaming', suggestedPrice: 29.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.crunchyroll.com/account/membership' },

  // Música
  { name: 'Spotify Premium', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.spotify.com/br/account/subscription/' },
  { name: 'Spotify Família', category: 'music', suggestedPrice: 34.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.spotify.com/br/account/subscription/' },
  { name: 'Apple Music', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly', billingSource: 'apple' },
  { name: 'YouTube Music', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly', billingSource: 'google' },
  { name: 'Deezer', category: 'music', suggestedPrice: 19.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.deezer.com/account/manage' },
  { name: 'Tidal', category: 'music', suggestedPrice: 16.9, suggestedCycle: 'monthly', cancelUrl: 'https://account.tidal.com/' },

  // Games
  { name: 'Xbox Game Pass Ultimate', category: 'gaming', suggestedPrice: 44.99, suggestedCycle: 'monthly', cancelUrl: 'https://account.microsoft.com/services' },
  { name: 'PlayStation Plus Essential', category: 'gaming', suggestedPrice: 34.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.playstation.com/subscriptions' },
  { name: 'PlayStation Plus Extra', category: 'gaming', suggestedPrice: 64.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.playstation.com/subscriptions' },
  { name: 'Nintendo Switch Online', category: 'gaming', suggestedPrice: 19.99, suggestedCycle: 'annual' },
  { name: 'Google Play Pass', category: 'gaming', suggestedPrice: 14.9, suggestedCycle: 'monthly', billingSource: 'google' },
  { name: 'Apple Arcade', category: 'gaming', suggestedPrice: 14.9, suggestedCycle: 'monthly', billingSource: 'apple' },

  // Fitness
  { name: 'Smart Fit', category: 'fitness', suggestedPrice: 99.9, suggestedCycle: 'monthly' },
  { name: 'Gympass / Wellhub', category: 'fitness', suggestedPrice: 99.9, suggestedCycle: 'monthly' },
  { name: 'Strava', category: 'fitness', suggestedPrice: 39.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.strava.com/settings/subscription' },

  // Cloud / Produtividade
  { name: 'iCloud+ 200GB', category: 'cloud', suggestedPrice: 14.9, suggestedCycle: 'monthly', billingSource: 'apple' },
  { name: 'Google One 100GB', category: 'cloud', suggestedPrice: 6.99, suggestedCycle: 'monthly', billingSource: 'google' },
  { name: 'Dropbox Plus', category: 'cloud', suggestedPrice: 49.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.dropbox.com/account/plan' },
  { name: 'Microsoft 365 Pessoal', category: 'productivity', suggestedPrice: 31, suggestedCycle: 'monthly', cancelUrl: 'https://account.microsoft.com/services' },
  { name: 'Notion', category: 'productivity', suggestedPrice: 50, suggestedCycle: 'monthly', cancelUrl: 'https://www.notion.so/my-account' },
  { name: 'ChatGPT Plus', category: 'productivity', suggestedPrice: 100, suggestedCycle: 'monthly' },
  { name: 'GitHub Copilot', category: 'productivity', suggestedPrice: 50, suggestedCycle: 'monthly', cancelUrl: 'https://github.com/settings/copilot' },

  // Comida
  { name: 'iFood Clube', category: 'food', suggestedPrice: 9.9, suggestedCycle: 'monthly' },
  { name: 'Uber One', category: 'food', suggestedPrice: 14.9, suggestedCycle: 'monthly' },

  // Notícias / Educação
  { name: 'Folha de S.Paulo', category: 'news', suggestedPrice: 39.9, suggestedCycle: 'monthly' },
  { name: 'Estadão', category: 'news', suggestedPrice: 9.9, suggestedCycle: 'monthly' },
  { name: 'The New York Times', category: 'news', suggestedPrice: 25, suggestedCycle: 'monthly', cancelUrl: 'https://www.nytimes.com/subscription' },
  { name: 'Alura', category: 'education', suggestedPrice: 109.9, suggestedCycle: 'monthly' },
  { name: 'Duolingo Super', category: 'education', suggestedPrice: 32.9, suggestedCycle: 'monthly' },

  // Finanças
  { name: 'Status Invest Premium', category: 'finance', suggestedPrice: 29.9, suggestedCycle: 'monthly' },

  // Outros
  { name: 'LinkedIn Premium', category: 'productivity', suggestedPrice: 109.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.linkedin.com/premium/manage/' },
  { name: 'Canva Pro', category: 'productivity', suggestedPrice: 44.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.canva.com/settings/billing-and-teams' },
];

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function searchCatalog(query: string, limit = 6): CatalogService[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return SERVICE_CATALOG.filter((s) =>
    normalize(s.name).includes(q),
  ).slice(0, limit);
}

/**
 * Encontra a melhor entrada do catálogo pra um nome digitado livremente.
 * Tenta match exato e depois substring nos dois sentidos, preferindo
 * entradas com cancelUrl e nomes mais específicos.
 */
export function findCatalogMatch(name: string): CatalogService | null {
  const n = normalize(name);
  if (n.length < 2) return null;

  const exact = SERVICE_CATALOG.find((s) => normalize(s.name) === n);
  if (exact) return exact;

  const candidates = SERVICE_CATALOG.filter((s) => {
    const cn = normalize(s.name);
    return n.includes(cn) || cn.includes(n);
  });
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const au = a.cancelUrl ? 1 : 0;
    const bu = b.cancelUrl ? 1 : 0;
    if (au !== bu) return bu - au;
    return b.name.length - a.name.length;
  });
  return candidates[0];
}
