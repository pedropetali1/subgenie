# SubGenie — Gestor de Assinaturas Pessoal

## Visão Geral

SaaS B2C que centraliza todas as assinaturas do usuário (streaming, apps, academia, etc.), alerta antes de cobranças e mostra quanto ele gasta. Monetização freemium com plano premium R$9,90/mês.

**Público-alvo:** Jovens adultos (18–35) no Brasil que acumulam múltiplas assinaturas e perdem controle dos gastos recorrentes.

**Proposta de valor:** "Descubra pra onde vai seu dinheiro todo mês — e pare de pagar por coisas que você nem usa."

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| Estilização | Tailwind CSS |
| Backend/API | Next.js API Routes (Route Handlers) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (Google, Apple, e-mail magic link) |
| Pagamentos | Stripe (checkout, billing portal, webhooks) |
| E-mail/Notificações | Resend (transacional) |
| Deploy | Vercel |
| Cron Jobs | Vercel Cron ou Supabase Edge Functions |
| Validação | Zod |
| ORM | Drizzle ORM |

---

## Arquitetura de Pastas

```
subgenie/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # sidebar + topbar
│   │   │   ├── page.tsx              # dashboard principal
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx          # lista de assinaturas
│   │   │   │   └── [id]/page.tsx     # detalhe/edição
│   │   │   ├── insights/page.tsx     # analytics e gastos
│   │   │   └── settings/page.tsx     # perfil, plano, notificações
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts
│   │   │   ├── subscriptions/
│   │   │   │   └── route.ts
│   │   │   ├── cron/
│   │   │   │   └── notify/route.ts   # cron de alertas
│   │   │   └── billing/
│   │   │       └── portal/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                  # landing page
│   ├── components/
│   │   ├── ui/                       # componentes base (button, input, card, modal, badge)
│   │   ├── subscription-card.tsx
│   │   ├── subscription-form.tsx
│   │   ├── spending-chart.tsx
│   │   ├── category-bar.tsx
│   │   ├── upcoming-alerts.tsx
│   │   └── pricing-section.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # browser client
│   │   │   ├── server.ts             # server client
│   │   │   └── middleware.ts         # auth middleware
│   │   ├── stripe.ts                 # stripe helpers
│   │   ├── resend.ts                 # email helpers
│   │   ├── constants.ts              # categorias, ciclos, limites
│   │   └── utils.ts                  # cálculos de datas, formatação
│   ├── hooks/
│   │   ├── use-subscriptions.ts
│   │   └── use-user-plan.ts
│   └── types/
│       └── index.ts
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── public/
│   ├── og-image.png
│   └── icons/                        # ícones de serviços populares
├── .env.example
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Modelagem de Dados (Supabase/PostgreSQL)

### Tabela `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  stripe_customer_id TEXT,
  notification_days_before INTEGER NOT NULL DEFAULT 3,
  notification_email BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tabela `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  cycle TEXT NOT NULL CHECK (cycle IN ('weekly','monthly','quarterly','semiannual','annual')),
  category TEXT NOT NULL CHECK (category IN (
    'streaming','music','gaming','fitness','cloud',
    'food','news','education','productivity','finance','other'
  )),
  start_date DATE NOT NULL,
  next_billing_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT,
  cancel_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_next_billing ON subscriptions(next_billing_date);
```

### Tabela `notification_log`

```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email','push')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  billing_date DATE NOT NULL
);

CREATE UNIQUE INDEX idx_notif_unique
  ON notification_log(subscription_id, billing_date, type);
```

### RLS (Row Level Security)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- profiles: user can only read/update own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- subscriptions: user can CRUD own subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- notification_log: user can view own logs
CREATE POLICY "Users can view own notifications"
  ON notification_log FOR SELECT USING (auth.uid() = user_id);
```

---

## Funcionalidades

### Fase 1 — MVP (Semana 1–2)

#### 1.1 Landing Page (`/`)

- Hero com headline, sub-headline e CTA "Comece grátis"
- Seção de features com ícones
- Seção de pricing (Free vs Premium)
- Footer simples
- SEO: meta tags, OG image, structured data

#### 1.2 Autenticação

- Login via Google OAuth (prioridade)
- Login via magic link (e-mail)
- Middleware protegendo rotas `/dashboard/*`
- Criar perfil automaticamente no primeiro login (trigger ou on-signup)

#### 1.3 Dashboard Principal (`/dashboard`)

- Resumo com 3 cards: gasto mensal, gasto anual estimado, cobranças nos próximos 7 dias
- Lista das próximas 5 cobranças ordenadas por data
- Botão "Nova assinatura"
- Estado vazio amigável quando não há assinaturas

#### 1.4 CRUD de Assinaturas (`/subscriptions`)

- Listagem com cards mostrando: nome, ícone da categoria, valor, ciclo, badge de dias até cobrança
- Formulário de criação/edição em modal ou drawer:
  - Nome (text, obrigatório)
  - Valor (number, obrigatório)
  - Ciclo (select: semanal, mensal, trimestral, semestral, anual)
  - Categoria (select com ícone)
  - Data de início (date picker)
  - Notas (textarea, opcional)
  - URL de cancelamento (text, opcional)
  - Ativo/Inativo (toggle)
- Filtro por categoria
- Ordenação: próxima cobrança (padrão), nome A-Z, maior valor
- Cálculo automático de `next_billing_date` baseado em `start_date` + `cycle`
- Recalcular `next_billing_date` quando a data passa (via cron ou on-access)
- Deletar com confirmação

#### 1.5 Tela de Insights (`/insights`)

- Gasto mensal total (soma dos equivalentes mensais)
- Gasto anual estimado
- Breakdown por categoria com barras horizontais e % do total
- Assinatura mais cara
- Preço médio por assinatura

#### 1.6 Notificações por E-mail

- Cron job diário (Vercel Cron, 08:00 BRT)
- Buscar assinaturas com `next_billing_date` dentro de X dias do `notification_days_before` do usuário
- Checar `notification_log` pra não enviar duplicados
- E-mail via Resend com template HTML simples: nome do serviço, valor, data de cobrança
- Logar envio em `notification_log`

### Fase 2 — Premium + Growth (Semana 3–4)

#### 2.1 Billing com Stripe

- Checkout Session para upgrade Free → Premium
- Billing Portal para gerenciar assinatura
- Webhook handler:
  - `checkout.session.completed` → atualizar `profiles.plan = 'premium'`
  - `customer.subscription.deleted` → downgrade para `'free'`
  - `invoice.payment_failed` → enviar e-mail de aviso
- Produto no Stripe: "SubGenie Premium" — R$9,90/mês

#### 2.2 Limites por Plano

| Feature | Free | Premium |
|---|---|---|
| Assinaturas cadastradas | Até 5 | Ilimitado |
| Alertas por e-mail | 1 dia antes | 1, 3, 7 dias antes (configurável) |
| Insights | Básico (total + categorias) | Completo (tendências, comparativo mensal) |
| Exportar dados | — | CSV |
| Tema escuro | ✓ | ✓ |

#### 2.3 Insights Premium

- Gráfico de linha: evolução do gasto mensal nos últimos 6 meses
- Comparativo mês a mês (quanto subiu/desceu)
- Sugestões automáticas: "Você tem 3 streamings ativos. Considere consolidar?"

#### 2.4 Exportar CSV

- Botão "Exportar" na tela de assinaturas
- Gerar CSV com: nome, valor, ciclo, categoria, próxima cobrança, status
- Download direto no browser

#### 2.5 Settings (`/settings`)

- Editar nome e avatar
- Configurar dias de antecedência para alertas
- Toggle e-mail on/off
- Gerenciar plano (link para Stripe Billing Portal)
- Excluir conta (soft delete ou hard delete com confirmação)

### Fase 3 — Diferenciação (Semana 5+)

- PWA com install prompt (mobile-first)
- Push notifications via web push API
- Detecção automática de assinaturas via leitura de e-mail (integração Gmail com OAuth, opt-in)
- Catálogo de serviços populares com logos e preços sugeridos (autocompletar ao digitar nome)
- Compartilhamento de assinatura: "Eu pago Netflix R$55 dividido com 3 pessoas" → calcula custo real
- Dark/light mode toggle
- Internacionalização (pt-BR, en)

---

## Lógica de Negócio Crítica

### Cálculo de `next_billing_date`

```typescript
function calculateNextBilling(startDate: Date, cycle: string): Date {
  const now = new Date();
  const next = new Date(startDate);
  const monthsMap: Record<string, number> = {
    weekly: 0,    // tratamento especial
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12,
  };

  if (cycle === 'weekly') {
    while (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else {
    while (next <= now) {
      next.setMonth(next.getMonth() + monthsMap[cycle]);
    }
  }

  return next;
}
```

### Equivalente mensal

```typescript
function monthlyEquivalent(price: number, cycle: string): number {
  const divisors: Record<string, number> = {
    weekly: 0.25,
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12,
  };
  return price / divisors[cycle];
}
```

---

## API Routes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/subscriptions` | Listar assinaturas do usuário autenticado |
| POST | `/api/subscriptions` | Criar nova assinatura |
| PUT | `/api/subscriptions/[id]` | Atualizar assinatura |
| DELETE | `/api/subscriptions/[id]` | Deletar assinatura |
| POST | `/api/billing/portal` | Gerar URL do Stripe Billing Portal |
| POST | `/api/webhooks/stripe` | Webhook do Stripe |
| GET | `/api/cron/notify` | Cron job de notificações (protegido por CRON_SECRET) |

Todas as rotas (exceto webhook e cron) devem verificar autenticação via Supabase server client.

---

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=              # price do plano premium

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=alertas@subgenie.com.br

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=                  # segredo para proteger rota de cron
```

---

## Design System

### Cores

```
--bg-primary: #0a0a14
--bg-card: #16162a
--bg-input: #0d0d1a
--border: #2a2a3a
--text-primary: #e0e0e8
--text-secondary: #8888a0
--accent: #6C5CE7
--accent-hover: #a855f7
--success: #1DB954
--warning: #ff8c00
--danger: #ff4444
```

### Categorias e Cores

```
streaming:    🎬  #E50914
music:        🎵  #1DB954
gaming:       🎮  #7B2FBE
fitness:      💪  #FF6B35
cloud:        ☁️  #0078D4
food:         🍔  #FF3008
news:         📰  #1A73E8
education:    📚  #F4B400
productivity: ⚡  #00B4D8
finance:      💰  #10B981
other:        📦  #6B7280
```

### Tipografia

- Heading: `font-family: 'DM Sans', sans-serif` — weight 700/800
- Body: `font-family: 'DM Sans', sans-serif` — weight 400/500
- Mono: `font-family: 'JetBrains Mono', monospace` — para valores

### Componentes Base

- Border radius: `12px` (cards), `8px` (inputs), `20px` (badges/chips)
- Sombra: nenhuma (dark mode, usar bordas sutis)
- Transições: `150ms ease` para hovers, `200ms ease` para modais
- Espaçamento: múltiplos de 4px (4, 8, 12, 16, 20, 24, 32, 48)

---

## Validações (Zod)

```typescript
import { z } from 'zod';

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  price: z.number().positive('Valor deve ser positivo').max(99999),
  cycle: z.enum(['weekly', 'monthly', 'quarterly', 'semiannual', 'annual']),
  category: z.enum([
    'streaming', 'music', 'gaming', 'fitness', 'cloud',
    'food', 'news', 'education', 'productivity', 'finance', 'other'
  ]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  notes: z.string().max(500).optional(),
  cancel_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});
```

---

## Template de E-mail de Alerta

Enviar via Resend com React Email ou HTML inline:

**Assunto:** `⚠️ {nome_servico} cobra {valor} em {dias} dia(s)`

**Corpo:**
- Saudação com nome do usuário
- Card com: logo/ícone da categoria, nome do serviço, valor, data de cobrança
- Se tiver `cancel_url`: link "Gerenciar assinatura"
- CTA: "Ver todas as assinaturas" → link para o dashboard
- Footer: "Você recebe este e-mail porque ativou alertas no SubGenie."

---

## Checklist de Qualidade

- [ ] RLS ativado e testado em todas as tabelas
- [ ] Webhook do Stripe validando assinatura do evento
- [ ] Rate limiting na API (middleware ou Vercel config)
- [ ] Loading states e skeletons em todas as páginas
- [ ] Empty states com CTA em todas as listas
- [ ] Tratamento de erro em todas as chamadas de API
- [ ] Mobile responsive em todas as telas
- [ ] Lighthouse score > 90 em performance
- [ ] Meta tags + OG image na landing
- [ ] `.env.example` completo e documentado
- [ ] README com instruções de setup local
