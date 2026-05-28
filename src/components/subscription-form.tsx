'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, CATEGORY_MAP, CYCLES } from '@/lib/constants';
import { formatCurrency, toISODate } from '@/lib/utils';
import {
  findCatalogMatch,
  searchCatalog,
  type CatalogService,
} from '@/lib/service-catalog';
import {
  BILLING_SOURCES,
  getCancellationTarget,
} from '@/lib/cancellation';
import type { BillingSource, Category, Cycle, Subscription } from '@/types';

interface Props {
  initial?: Subscription;
  onSaved: (s: Subscription) => void;
  onDeleted?: (id: string) => void;
  onCancel: () => void;
}

export function SubscriptionForm({ initial, onSaved, onDeleted, onCancel }: Props) {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState<string>(
    initial?.price !== undefined ? String(initial.price) : '',
  );
  const [cycle, setCycle] = useState<Cycle>(initial?.cycle ?? 'monthly');
  const [category, setCategory] = useState<Category>(
    initial?.category ?? 'streaming',
  );
  const [startDate, setStartDate] = useState(
    initial?.start_date ?? toISODate(new Date()),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [cancelUrl, setCancelUrl] = useState(initial?.cancel_url ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sharedCount, setSharedCount] = useState<number>(
    initial?.shared_count ?? 1,
  );
  const [billingSource, setBillingSource] = useState<BillingSource>(
    initial?.billing_source ?? 'web',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<CatalogService[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) return;
    setSuggestions(searchCatalog(name));
  }, [name, isEdit]);

  function pickSuggestion(s: CatalogService) {
    setName(s.name);
    setPrice(String(s.suggestedPrice));
    setCycle(s.suggestedCycle);
    setCategory(s.category);
    if (s.cancelUrl) setCancelUrl(s.cancelUrl);
    setBillingSource(s.billingSource ?? 'web');
    setShowSuggestions(false);
  }

  const numPrice = Number(String(price).replace(',', '.'));
  const effectivePrice =
    numPrice && sharedCount > 1 ? numPrice / sharedCount : numPrice;

  // Sugestão de cancelamento baseada no nome (catálogo).
  const cancelSuggestion = useMemo(() => {
    const m = findCatalogMatch(name);
    if (!m) return null;
    const wouldSetUrl = !!m.cancelUrl && !cancelUrl;
    const wouldSetSource = !!m.billingSource && m.billingSource !== billingSource;
    if (!wouldSetUrl && !wouldSetSource) return null;
    return { match: m, wouldSetUrl, wouldSetSource };
  }, [name, cancelUrl, billingSource]);

  function applyCancelSuggestion() {
    if (!cancelSuggestion) return;
    const m = cancelSuggestion.match;
    if (m.cancelUrl) setCancelUrl(m.cancelUrl);
    if (m.billingSource) setBillingSource(m.billingSource);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Nome é obrigatório');
    if (!numPrice || numPrice <= 0)
      return setError('Valor deve ser maior que zero');

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price: numPrice,
        cycle,
        category,
        start_date: startDate,
        notes: notes || null,
        cancel_url: cancelUrl || null,
        is_active: isActive,
        shared_count: sharedCount,
        billing_source: billingSource,
      };

      const url = isEdit
        ? `/api/subscriptions/${initial!.id}`
        : '/api/subscriptions';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar');
        return;
      }
      onSaved(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${initial.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao deletar');
        return;
      }
      onDeleted?.(initial.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Label htmlFor="name">Nome</Label>
        <Input
          ref={nameRef}
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Netflix, Spotify..."
          required
          autoFocus
          autoComplete="off"
        />
        {!isEdit && showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-input border border-border bg-bg-card shadow-lg">
            {suggestions.map((s) => {
              const c = CATEGORY_MAP[s.category];
              return (
                <li key={s.name}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(s)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#1d1d35]"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-input text-sm"
                      style={{ backgroundColor: `${c.color}22`, color: c.color }}
                    >
                      {c.emoji}
                    </span>
                    <span className="flex-1 text-sm text-text-primary">
                      {s.name}
                    </span>
                    <span className="font-mono text-xs text-text-secondary">
                      {formatCurrency(s.suggestedPrice)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Valor (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="55,90"
            required
          />
        </div>
        <div>
          <Label htmlFor="cycle">Ciclo</Label>
          <Select
            id="cycle"
            value={cycle}
            onChange={(e) => setCycle(e.target.value as Cycle)}
          >
            {CYCLES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="start_date">Data de início</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="shared_count">Dividida com quantas pessoas?</Label>
        <div className="flex items-center gap-3">
          <Input
            id="shared_count"
            type="number"
            min={1}
            max={20}
            value={sharedCount}
            onChange={(e) => setSharedCount(Math.max(1, Number(e.target.value) || 1))}
            className="max-w-[100px]"
          />
          {sharedCount > 1 && numPrice > 0 && (
            <span className="text-sm text-text-secondary">
              Seu custo real:{' '}
              <strong className="font-mono text-text-primary">
                {formatCurrency(effectivePrice)}
              </strong>{' '}
              ({sharedCount}× partes)
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="billing_source">Onde é cobrada?</Label>
        <Select
          id="billing_source"
          value={billingSource}
          onChange={(e) => setBillingSource(e.target.value as BillingSource)}
        >
          {BILLING_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.emoji ? `${s.emoji} ` : ''}
              {s.label}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-text-secondary">
          Define pra onde te levamos na hora de cancelar.
        </p>
      </div>

      {(billingSource === 'web' || billingSource === 'other') && (
        <div>
          <Label htmlFor="cancel_url">URL de cancelamento (opcional)</Label>
          <Input
            id="cancel_url"
            type="url"
            value={cancelUrl ?? ''}
            onChange={(e) => setCancelUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {cancelSuggestion && (
        <div className="rounded-input border border-accent/30 bg-accent/10 p-3">
          <p className="mb-2 text-xs text-text-secondary">
            Reconhecemos{' '}
            <strong className="text-text-primary">
              {cancelSuggestion.match.name}
            </strong>
            . Quer usar o cancelamento conhecido
            {cancelSuggestion.wouldSetSource && cancelSuggestion.match.billingSource !== 'web'
              ? ' (via loja)'
              : ''}
            ?
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={applyCancelSuggestion}
          >
            Usar cancelamento de {cancelSuggestion.match.name}
          </Button>
        </div>
      )}

      <CancelAction
        billingSource={billingSource}
        cancelUrl={cancelUrl ?? ''}
        name={name || 'esta assinatura'}
      />

      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Plano família, divido com 3 pessoas..."
          rows={3}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-bg-input"
        />
        Assinatura ativa
      </label>

      {error && (
        <p className="rounded-input border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {confirmDelete && isEdit && (
        <div className="rounded-input border border-danger/30 bg-danger/10 px-3 py-3 text-sm">
          <p className="mb-2 text-danger font-medium">
            Tem certeza? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deletando...' : 'Sim, deletar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {isEdit && !confirmDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            Deletar
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function CancelAction({
  billingSource,
  cancelUrl,
  name,
}: {
  billingSource: BillingSource;
  cancelUrl: string;
  name: string;
}) {
  const target = getCancellationTarget({
    billing_source: billingSource,
    cancel_url: cancelUrl || null,
    name,
  });

  return (
    <div className="rounded-input border border-border bg-bg-input p-3">
      <p className="mb-1 text-sm font-medium text-text-primary">
        Cancelar assinatura
      </p>
      <p className="mb-3 text-xs text-text-secondary">{target.hint}</p>
      {target.url ? (
        <a
          href={target.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-input bg-bg-card px-3 text-sm font-medium text-text-primary border border-border transition-colors hover:bg-[#1d1d35]"
        >
          {target.label} ↗
        </a>
      ) : (
        <span className="text-xs text-text-secondary italic">
          {target.label}
        </span>
      )}
    </div>
  );
}
