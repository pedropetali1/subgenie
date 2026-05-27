import { CATEGORY_MAP, CYCLE_MAP } from './constants';
import { toISODate } from './utils';
import type { Subscription } from '@/types';

export function subscriptionsToCsv(subs: Subscription[]): string {
  const headers = [
    'nome',
    'valor',
    'dividida_por',
    'custo_real',
    'moeda',
    'ciclo',
    'categoria',
    'data_inicio',
    'proxima_cobranca',
    'status',
    'notas',
  ];

  const rows = subs.map((s) => {
    const shared = s.shared_count && s.shared_count > 1 ? s.shared_count : 1;
    const effective = Number(s.price) / shared;
    return [
      s.name,
      String(s.price),
      String(shared),
      effective.toFixed(2),
      s.currency,
      CYCLE_MAP[s.cycle].label,
      CATEGORY_MAP[s.category].label,
      s.start_date,
      s.next_billing_date,
      s.is_active ? 'ativa' : 'inativa',
      s.notes ?? '',
    ];
  });

  const escape = (v: string) => {
    if (v.includes('"') || v.includes(',') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const lines = [
    headers.join(','),
    ...rows.map((r) => r.map(escape).join(',')),
  ];

  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['﻿' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function defaultCsvFilename(): string {
  return `subsly-assinaturas-${toISODate(new Date())}.csv`;
}
