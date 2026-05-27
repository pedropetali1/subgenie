import { CATEGORY_MAP } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import type { Category } from '@/types';

interface BreakdownItem {
  category: Category;
  total: number;
  percent: number;
}

interface Props {
  items: BreakdownItem[];
}

export function CategoryBar({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-secondary">
        Sem dados pra exibir.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const cat = CATEGORY_MAP[item.category];
        return (
          <li key={item.category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-primary">
                <span>{cat.emoji}</span>
                <span className="font-medium">{cat.label}</span>
                <span className="text-text-secondary">
                  · {item.percent.toFixed(0)}%
                </span>
              </div>
              <span className="font-mono font-semibold text-text-primary">
                {formatCurrency(item.total)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-input">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.max(item.percent, 2)}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
