import type { Category, Cycle } from '@/types';

export const CYCLES: { value: Cycle; label: string; monthlyDivisor: number }[] = [
  { value: 'weekly', label: 'Semanal', monthlyDivisor: 0.25 },
  { value: 'monthly', label: 'Mensal', monthlyDivisor: 1 },
  { value: 'quarterly', label: 'Trimestral', monthlyDivisor: 3 },
  { value: 'semiannual', label: 'Semestral', monthlyDivisor: 6 },
  { value: 'annual', label: 'Anual', monthlyDivisor: 12 },
];

export const CATEGORIES: {
  value: Category;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: 'streaming', label: 'Streaming', emoji: '🎬', color: '#E50914' },
  { value: 'music', label: 'Música', emoji: '🎵', color: '#1DB954' },
  { value: 'gaming', label: 'Games', emoji: '🎮', color: '#7B2FBE' },
  { value: 'fitness', label: 'Fitness', emoji: '💪', color: '#FF6B35' },
  { value: 'cloud', label: 'Cloud', emoji: '☁️', color: '#0078D4' },
  { value: 'food', label: 'Comida', emoji: '🍔', color: '#FF3008' },
  { value: 'news', label: 'Notícias', emoji: '📰', color: '#1A73E8' },
  { value: 'education', label: 'Educação', emoji: '📚', color: '#F4B400' },
  { value: 'productivity', label: 'Produtividade', emoji: '⚡', color: '#00B4D8' },
  { value: 'finance', label: 'Finanças', emoji: '💰', color: '#10B981' },
  { value: 'other', label: 'Outros', emoji: '📦', color: '#6B7280' },
];

export const CATEGORY_MAP: Record<
  Category,
  { label: string; emoji: string; color: string }
> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.value] = { label: c.label, emoji: c.emoji, color: c.color };
    return acc;
  },
  {} as Record<Category, { label: string; emoji: string; color: string }>,
);

export const CYCLE_MAP: Record<Cycle, { label: string; monthlyDivisor: number }> =
  CYCLES.reduce(
    (acc, c) => {
      acc[c.value] = { label: c.label, monthlyDivisor: c.monthlyDivisor };
      return acc;
    },
    {} as Record<Cycle, { label: string; monthlyDivisor: number }>,
  );

export const FREE_LIMITS = {
  maxSubscriptions: 5,
};
