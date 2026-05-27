import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBar } from '@/components/category-bar';
import { SpendingChart } from '@/components/spending-chart';
import {
  effectiveAnnual,
  effectiveMonthly,
  formatCurrency,
} from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/constants';
import { isPremium } from '@/lib/plan';
import type { Category, Plan, Subscription } from '@/types';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('profiles').select('plan').eq('id', user.id).single()
    : { data: null };
  const plan = (profile?.plan ?? 'free') as Plan;
  const premium = isPremium(plan);

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_active', true);

  const subscriptions = (subs ?? []) as Subscription[];

  const monthlyTotal = subscriptions.reduce(
    (sum, s) => sum + effectiveMonthly(s),
    0,
  );
  const annualTotal = subscriptions.reduce(
    (sum, s) => sum + effectiveAnnual(s),
    0,
  );

  const mostExpensive = [...subscriptions].sort(
    (a, b) => effectiveMonthly(b) - effectiveMonthly(a),
  )[0];

  const average =
    subscriptions.length > 0 ? monthlyTotal / subscriptions.length : 0;

  // Breakdown por categoria
  const byCategory = new Map<Category, number>();
  for (const s of subscriptions) {
    const m = effectiveMonthly(s);
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + m);
  }
  const breakdown = Array.from(byCategory.entries())
    .map(([category, total]) => ({
      category,
      total,
      percent: monthlyTotal > 0 ? (total / monthlyTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Premium-only: tendência últimos 6 meses
  const trend = premium ? buildTrend(subscriptions) : [];
  const monthDelta =
    trend.length >= 2 ? trend[trend.length - 1].value - trend[trend.length - 2].value : 0;

  // Premium-only: sugestões
  const suggestions = premium ? buildSuggestions(subscriptions) : [];

  if (subscriptions.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-bold text-text-primary md:text-3xl">
          Insights
        </h1>
        <p className="mb-8 text-sm text-text-secondary">
          Análise dos seus gastos com assinaturas.
        </p>
        <Card className="text-center py-12">
          <div className="mb-3 text-4xl">💡</div>
          <h3 className="mb-2 text-lg font-bold text-text-primary">
            Ainda sem dados pra analisar
          </h3>
          <p className="text-sm text-text-secondary">
            Adicione assinaturas pra ver insights detalhados aqui.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-text-primary md:text-3xl">
            Insights
          </h1>
          <p className="text-sm text-text-secondary">
            Análise dos seus gastos com assinaturas.
          </p>
        </div>
        <Badge variant={premium ? 'accent' : 'default'}>
          {premium ? 'Premium' : 'Free'}
        </Badge>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gasto mensal total</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(monthlyTotal)}</CardValue>
          {premium && trend.length >= 2 && (
            <p
              className={`mt-1 text-xs font-medium ${
                monthDelta > 0
                  ? 'text-warning'
                  : monthDelta < 0
                    ? 'text-success'
                    : 'text-text-secondary'
              }`}
            >
              {monthDelta > 0 ? '↑' : monthDelta < 0 ? '↓' : '='}{' '}
              {formatCurrency(Math.abs(monthDelta))} vs mês anterior
            </p>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gasto anual estimado</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(annualTotal)}</CardValue>
          <p className="mt-1 text-xs text-text-secondary">
            projeção pros próximos 12 meses
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mais cara</CardTitle>
          </CardHeader>
          {mostExpensive ? (
            <>
              <CardValue className="text-xl">{mostExpensive.name}</CardValue>
              <p className="mt-1 text-xs text-text-secondary">
                {formatCurrency(effectiveMonthly(mostExpensive))} / mês equiv.
                {mostExpensive.shared_count > 1 && (
                  <> · dividida por {mostExpensive.shared_count}</>
                )}
              </p>
            </>
          ) : (
            <CardValue>—</CardValue>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preço médio</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(average)}</CardValue>
          <p className="mt-1 text-xs text-text-secondary">
            por assinatura, ao mês
          </p>
        </Card>
      </div>

      {premium && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evolução do gasto (últimos 6 meses)</CardTitle>
          </CardHeader>
          <SpendingChart points={trend} />
        </Card>
      )}

      <Card className={premium && suggestions.length > 0 ? 'mb-6' : ''}>
        <CardHeader>
          <CardTitle>Gasto por categoria</CardTitle>
        </CardHeader>
        <CategoryBar items={breakdown} />
      </Card>

      {premium && suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sugestões</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-input border border-border bg-bg-input p-3 text-sm"
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="text-text-primary">{s.message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!premium && (
        <Card className="mt-6 border-accent/40 bg-gradient-to-b from-accent/10 to-bg-card">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="accent">Premium</Badge>
            <h3 className="font-bold text-text-primary">Quer ver mais?</h3>
          </div>
          <p className="mb-4 text-sm text-text-secondary">
            No Premium você vê evolução mensal, comparativos e recebe sugestões
            automáticas pra economizar.
          </p>
          <Link
            href="/settings"
            className="inline-flex rounded-input bg-accent hover:bg-accent-hover px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Conhecer Premium →
          </Link>
        </Card>
      )}
    </div>
  );
}

function buildTrend(subs: Subscription[]): { label: string; value: number }[] {
  const months: { date: Date; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      date: d,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    });
  }

  return months.map(({ date, label }) => {
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const value = subs
      .filter((s) => new Date(s.start_date + 'T00:00:00') <= endOfMonth)
      .reduce((sum, s) => sum + effectiveMonthly(s), 0);
    return { label, value };
  });
}

function buildSuggestions(
  subs: Subscription[],
): { emoji: string; message: string }[] {
  const out: { emoji: string; message: string }[] = [];

  // 1) Concentração por categoria
  const byCat = new Map<Category, number>();
  for (const s of subs) {
    byCat.set(s.category, (byCat.get(s.category) ?? 0) + 1);
  }
  for (const [cat, n] of byCat.entries()) {
    if (n >= 3) {
      const c = CATEGORY_MAP[cat];
      out.push({
        emoji: c.emoji,
        message: `Você tem ${n} assinaturas de ${c.label} ativas. Vale considerar consolidar.`,
      });
    }
  }

  // 2) Assinatura mais cara representando >40% do total
  const total = subs.reduce((sum, s) => sum + effectiveMonthly(s), 0);
  if (total > 0 && subs.length > 1) {
    const sorted = [...subs].sort(
      (a, b) => effectiveMonthly(b) - effectiveMonthly(a),
    );
    const top = sorted[0];
    const topMonthly = effectiveMonthly(top);
    const share = topMonthly / total;
    if (share > 0.4) {
      out.push({
        emoji: '💸',
        message: `${top.name} sozinha representa ${(share * 100).toFixed(0)}% do seu gasto mensal. Vale conferir se ainda usa muito.`,
      });
    }
  }

  return out;
}
