import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpcomingAlerts } from '@/components/upcoming-alerts';
import {
  daysUntil,
  effectiveAnnual,
  effectiveMonthly,
  formatCurrency,
} from '@/lib/utils';
import type { Subscription } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('is_active', true)
    .order('next_billing_date', { ascending: true });

  const subscriptions = (subs ?? []) as Subscription[];

  const monthlyTotal = subscriptions.reduce(
    (sum, s) => sum + effectiveMonthly(s),
    0,
  );
  const annualTotal = subscriptions.reduce(
    (sum, s) => sum + effectiveAnnual(s),
    0,
  );
  const upcomingWeek = subscriptions.filter((s) => {
    const d = daysUntil(s.next_billing_date);
    return d >= 0 && d <= 7;
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-text-primary md:text-3xl">
            Bom dia 👋
          </h1>
          <p className="text-sm text-text-secondary">
            Aqui está um resumo das suas assinaturas.
          </p>
        </div>
        <Link href="/subscriptions?new=1">
          <Button>+ Nova assinatura</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gasto mensal</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(monthlyTotal)}</CardValue>
          <p className="mt-1 text-xs text-text-secondary">
            {subscriptions.length} assinatura(s) ativa(s)
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gasto anual estimado</CardTitle>
          </CardHeader>
          <CardValue>{formatCurrency(annualTotal)}</CardValue>
          <p className="mt-1 text-xs text-text-secondary">
            Equivalente a 12× o gasto mensal
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximos 7 dias</CardTitle>
          </CardHeader>
          <CardValue>{upcomingWeek.length}</CardValue>
          <p className="mt-1 text-xs text-text-secondary">
            cobrança(s) a caminho
          </p>
        </Card>
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Próximas cobranças
          </h2>
          <Link
            href="/subscriptions"
            className="text-sm text-accent hover:text-accent-hover"
          >
            Ver todas →
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="mb-3 text-4xl">📋</div>
            <h3 className="mb-2 text-lg font-bold text-text-primary">
              Nenhuma assinatura ainda
            </h3>
            <p className="mb-5 text-sm text-text-secondary">
              Comece adicionando uma assinatura pra acompanhar seus gastos.
            </p>
            <Link href="/subscriptions?new=1">
              <Button>+ Adicionar primeira assinatura</Button>
            </Link>
          </Card>
        ) : (
          <UpcomingAlerts subscriptions={subscriptions} limit={5} />
        )}
      </div>
    </div>
  );
}
