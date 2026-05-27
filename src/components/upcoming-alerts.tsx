import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_MAP, CYCLE_MAP } from '@/lib/constants';
import { daysUntil, formatCurrency, formatShortDate } from '@/lib/utils';
import type { Subscription } from '@/types';

interface Props {
  subscriptions: Subscription[];
  limit?: number;
}

export function UpcomingAlerts({ subscriptions, limit }: Props) {
  const items = limit ? subscriptions.slice(0, limit) : subscriptions;

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-bg-card p-6 text-center text-sm text-text-secondary">
        Sem cobranças próximas.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-card">
      <ul className="divide-y divide-border">
        {items.map((s) => {
          const cat = CATEGORY_MAP[s.category];
          const days = daysUntil(s.next_billing_date);
          const variant =
            days <= 1 ? 'danger' : days <= 3 ? 'warning' : 'default';
          const label =
            days < 0
              ? `${Math.abs(days)} dia(s) atrás`
              : days === 0
                ? 'Hoje'
                : days === 1
                  ? 'Amanhã'
                  : `em ${days} dias`;

          return (
            <li key={s.id}>
              <Link
                href={`/subscriptions/${s.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1d1d35]"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input text-lg"
                  style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                >
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {s.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatShortDate(s.next_billing_date)} · {CYCLE_MAP[s.cycle].label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-text-primary">
                    {formatCurrency(Number(s.price), s.currency)}
                  </p>
                  <Badge variant={variant} className="mt-0.5">
                    {label}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
