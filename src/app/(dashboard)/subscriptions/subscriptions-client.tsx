'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { SubscriptionCard } from '@/components/subscription-card';
import { SubscriptionForm } from '@/components/subscription-form';
import { CATEGORIES } from '@/lib/constants';
import { daysUntil } from '@/lib/utils';
import {
  defaultCsvFilename,
  downloadCsv,
  subscriptionsToCsv,
} from '@/lib/csv';
import { isPremium } from '@/lib/plan';
import type { Category, Plan, Subscription } from '@/types';

type SortKey = 'next_billing' | 'name' | 'price_desc';

interface Props {
  plan: Plan;
}

export function SubscriptionsClient({ plan }: Props) {
  const premium = isPremium(plan);
  const router = useRouter();
  const search = useSearchParams();

  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('next_billing');

  const [editing, setEditing] = useState<Subscription | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (search.get('new') === '1') {
      setCreating(true);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar');
      setItems(data.subscriptions as Subscription[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let arr = filter === 'all' ? items : items.filter((s) => s.category === filter);
    arr = [...arr].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (sort === 'price_desc') return Number(b.price) - Number(a.price);
      return daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date);
    });
    return arr;
  }, [items, filter, sort]);

  function closeModal() {
    setCreating(false);
    setEditing(null);
    if (search.get('new')) router.replace('/subscriptions');
  }

  function handleSaved(s: Subscription) {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === s.id);
      return exists ? prev.map((p) => (p.id === s.id ? s : p)) : [s, ...prev];
    });
    closeModal();
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    closeModal();
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-text-primary md:text-3xl">
            Assinaturas
          </h1>
          <p className="text-sm text-text-secondary">
            {items.length} cadastrada(s)
          </p>
        </div>
        <div className="flex gap-2">
          {premium && items.length > 0 && (
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(defaultCsvFilename(), subscriptionsToCsv(items))
              }
            >
              Exportar CSV
            </Button>
          )}
          <Button onClick={() => setCreating(true)}>+ Nova</Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:items-center">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Category | 'all')}
          className="sm:max-w-[200px]"
        >
          <option value="all">Todas categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="sm:max-w-[200px]"
        >
          <option value="next_billing">Próxima cobrança</option>
          <option value="name">Nome (A-Z)</option>
          <option value="price_desc">Maior valor</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[96px] animate-pulse rounded-card border border-border bg-bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <Card className="text-center">
          <p className="text-danger">{error}</p>
          <Button variant="ghost" onClick={fetchData} className="mt-3">
            Tentar de novo
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mb-3 text-4xl">📋</div>
          <h3 className="mb-2 text-lg font-bold text-text-primary">
            {items.length === 0
              ? 'Nenhuma assinatura cadastrada'
              : 'Nenhuma assinatura nessa categoria'}
          </h3>
          <p className="mb-5 text-sm text-text-secondary">
            {items.length === 0
              ? 'Comece adicionando sua primeira assinatura.'
              : 'Tente trocar o filtro ou adicione uma nova.'}
          </p>
          <Button onClick={() => setCreating(true)}>
            + Adicionar assinatura
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <SubscriptionCard
              key={s.id}
              subscription={s}
              onClick={() => setEditing(s)}
            />
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={closeModal}
        title={editing ? 'Editar assinatura' : 'Nova assinatura'}
      >
        <SubscriptionForm
          initial={editing ?? undefined}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
