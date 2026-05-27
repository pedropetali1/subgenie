import type { Category, Cycle } from '@/types';

export interface CatalogService {
  name: string;
  category: Category;
  suggestedPrice: number;
  suggestedCycle: Cycle;
  cancelUrl?: string;
}

/** Catálogo de serviços populares no Brasil. */
export const SERVICE_CATALOG: CatalogService[] = [
  // Streaming
  { name: 'Netflix', category: 'streaming', suggestedPrice: 39.9, suggestedCycle: 'monthly', cancelUrl: 'https://www.netflix.com/cancelplan' },
  { name: 'Netflix Premium', category: 'streaming', suggestedPrice: 55.9, suggestedCycle: 'monthly' },
  { name: 'Disney+', category: 'streaming', suggestedPrice: 33.9, suggestedCycle: 'monthly' },
  { name: 'Max', category: 'streaming', suggestedPrice: 34.9, suggestedCycle: 'monthly' },
  { name: 'Prime Video', category: 'streaming', suggestedPrice: 14.9, suggestedCycle: 'monthly' },
  { name: 'Globoplay', category: 'streaming', suggestedPrice: 24.9, suggestedCycle: 'monthly' },
  { name: 'Paramount+', category: 'streaming', suggestedPrice: 19.9, suggestedCycle: 'monthly' },
  { name: 'Apple TV+', category: 'streaming', suggestedPrice: 14.9, suggestedCycle: 'monthly' },
  { name: 'Crunchyroll', category: 'streaming', suggestedPrice: 29.9, suggestedCycle: 'monthly' },

  // Música
  { name: 'Spotify Premium', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly' },
  { name: 'Spotify Família', category: 'music', suggestedPrice: 34.9, suggestedCycle: 'monthly' },
  { name: 'Apple Music', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly' },
  { name: 'YouTube Music', category: 'music', suggestedPrice: 21.9, suggestedCycle: 'monthly' },
  { name: 'Deezer', category: 'music', suggestedPrice: 19.9, suggestedCycle: 'monthly' },
  { name: 'Tidal', category: 'music', suggestedPrice: 16.9, suggestedCycle: 'monthly' },

  // Games
  { name: 'Xbox Game Pass Ultimate', category: 'gaming', suggestedPrice: 44.99, suggestedCycle: 'monthly' },
  { name: 'PlayStation Plus Essential', category: 'gaming', suggestedPrice: 34.9, suggestedCycle: 'monthly' },
  { name: 'PlayStation Plus Extra', category: 'gaming', suggestedPrice: 64.9, suggestedCycle: 'monthly' },
  { name: 'Nintendo Switch Online', category: 'gaming', suggestedPrice: 19.99, suggestedCycle: 'annual' },

  // Fitness
  { name: 'Smart Fit', category: 'fitness', suggestedPrice: 99.9, suggestedCycle: 'monthly' },
  { name: 'Gympass / Wellhub', category: 'fitness', suggestedPrice: 99.9, suggestedCycle: 'monthly' },
  { name: 'Strava', category: 'fitness', suggestedPrice: 39.9, suggestedCycle: 'monthly' },

  // Cloud / Produtividade
  { name: 'iCloud+ 200GB', category: 'cloud', suggestedPrice: 14.9, suggestedCycle: 'monthly' },
  { name: 'Google One 100GB', category: 'cloud', suggestedPrice: 6.99, suggestedCycle: 'monthly' },
  { name: 'Dropbox Plus', category: 'cloud', suggestedPrice: 49.9, suggestedCycle: 'monthly' },
  { name: 'Microsoft 365 Pessoal', category: 'productivity', suggestedPrice: 31, suggestedCycle: 'monthly' },
  { name: 'Notion', category: 'productivity', suggestedPrice: 50, suggestedCycle: 'monthly' },
  { name: 'ChatGPT Plus', category: 'productivity', suggestedPrice: 100, suggestedCycle: 'monthly' },
  { name: 'GitHub Copilot', category: 'productivity', suggestedPrice: 50, suggestedCycle: 'monthly' },

  // Comida
  { name: 'iFood Clube', category: 'food', suggestedPrice: 9.9, suggestedCycle: 'monthly' },
  { name: 'Uber One', category: 'food', suggestedPrice: 14.9, suggestedCycle: 'monthly' },

  // Notícias / Educação
  { name: 'Folha de S.Paulo', category: 'news', suggestedPrice: 39.9, suggestedCycle: 'monthly' },
  { name: 'Estadão', category: 'news', suggestedPrice: 9.9, suggestedCycle: 'monthly' },
  { name: 'The New York Times', category: 'news', suggestedPrice: 25, suggestedCycle: 'monthly' },
  { name: 'Alura', category: 'education', suggestedPrice: 109.9, suggestedCycle: 'monthly' },
  { name: 'Duolingo Super', category: 'education', suggestedPrice: 32.9, suggestedCycle: 'monthly' },

  // Finanças
  { name: 'Status Invest Premium', category: 'finance', suggestedPrice: 29.9, suggestedCycle: 'monthly' },

  // Outros
  { name: 'LinkedIn Premium', category: 'productivity', suggestedPrice: 109.9, suggestedCycle: 'monthly' },
  { name: 'Canva Pro', category: 'productivity', suggestedPrice: 44.9, suggestedCycle: 'monthly' },
];

export function searchCatalog(query: string, limit = 6): CatalogService[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return SERVICE_CATALOG.filter((s) =>
    s.name.toLowerCase().includes(q),
  ).slice(0, limit);
}
