import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Cycle, Subscription } from '@/types';
import { CYCLE_MAP } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(d);
}

/**
 * Calcula a próxima data de cobrança a partir da data de início e ciclo.
 * Avança até superar a data atual.
 */
export function calculateNextBilling(
  startDate: string | Date,
  cycle: Cycle,
  reference: Date = new Date(),
): Date {
  const start =
    typeof startDate === 'string'
      ? new Date(startDate + 'T00:00:00')
      : new Date(startDate);
  const next = new Date(start);
  const today = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );

  const monthsMap: Record<Exclude<Cycle, 'weekly'>, number> = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12,
  };

  if (cycle === 'weekly') {
    while (next < today) {
      next.setDate(next.getDate() + 7);
    }
  } else {
    while (next < today) {
      next.setMonth(next.getMonth() + monthsMap[cycle]);
    }
  }

  return next;
}

/** Equivalente mensal do preço, considerando ciclo. */
export function monthlyEquivalent(price: number, cycle: Cycle): number {
  return price / CYCLE_MAP[cycle].monthlyDivisor;
}

/** Equivalente anual do preço. */
export function annualEquivalent(price: number, cycle: Cycle): number {
  return monthlyEquivalent(price, cycle) * 12;
}

/** Custo efetivo (preço / pessoas dividindo). Default 1 se ausente. */
export function effectivePrice(s: Pick<Subscription, 'price' | 'shared_count'>): number {
  const n = s.shared_count && s.shared_count > 1 ? s.shared_count : 1;
  return Number(s.price) / n;
}

export function effectiveMonthly(s: Subscription): number {
  return monthlyEquivalent(effectivePrice(s), s.cycle);
}

export function effectiveAnnual(s: Subscription): number {
  return effectiveMonthly(s) * 12;
}

/** Dias até a próxima cobrança a partir de hoje (negativos se já passou). */
export function daysUntil(date: string | Date, reference: Date = new Date()): number {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const today = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  const diff = d.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** Formata uma Date como ISO YYYY-MM-DD sem timezone. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
