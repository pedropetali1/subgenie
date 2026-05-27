'use client';

import { Badge } from '@/components/ui/badge';
import { CATEGORY_MAP, CYCLE_MAP } from '@/lib/constants';
import {
  daysUntil,
  effectivePrice,
  formatCurrency,
  formatShortDate,
} from '@/lib/utils';
import type { Subscription } from '@/types';

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}

export function SubscriptionCard({ subscription: s, onClick }: Props) {
  const cat = CATEGORY_MAP[s.category];
  const days = daysUntil(s.next_billing_date);
  const variant =
    !s.is_active
      ? 'default'
      : days <= 1
        ? 'danger'
        : days <= 3
          ? 'warning'
          : 'default';
  const label = !s.is_active
    ? 'Inativa'
    : days < 0
      ? `${Math.abs(days)}d atrás`
      : days === 0
        ? 'Hoje'
        : days === 1
          ? 'Amanhã'
          : `em ${days}d`;

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-card border border-border bg-bg-card p-4 text-left transition-colors hover:border-accent/40 hover:bg-[#1d1d35]"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input text-2xl"
        style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
      >
        {cat.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-text-primary">
            {s.name}
          </h3>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <p className="mb-2 text-xs text-text-secondary">
          {cat.label} · {CYCLE_MAP[s.cycle].label}
          {s.shared_count > 1 && <> · ÷ {s.shared_count}</>}
        </p>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-text-primary">
              {formatCurrency(Number(s.price), s.currency)}
            </span>
            {s.shared_count > 1 && (
              <span className="font-mono text-xs text-text-secondary">
                ({formatCurrency(effectivePrice(s), s.currency)} pra você)
              </span>
            )}
          </div>
          <span className="text-xs text-text-secondary">
            {formatShortDate(s.next_billing_date)}
          </span>
        </div>
      </div>
    </button>
  );
}
