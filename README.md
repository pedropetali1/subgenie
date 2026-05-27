# Subsly

Gestor pessoal de assinaturas. Centraliza streaming, apps, academia e tudo mais num lugar só — com alertas antes da cobrança e insights de gasto.

## Stack

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind CSS** (tema escuro)
- **Supabase** (PostgreSQL + Auth com Google e magic link)
- **Resend** (e-mails transacionais)
- **Zod** (validação)
- **Vercel** + Vercel Cron (deploy + cron job diário)

## Fase 1 — MVP

Implementado:

- Landing page com hero, features, pricing e SEO
- Auth via Google OAuth e magic link
- Dashboard com gasto mensal, anual, próximos 7 dias e lista de cobranças próximas
- CRUD completo de assinaturas com filtro por categoria, ordenação e modal de edição
- Tela de Insights com breakdown por categoria, mais cara e preço médio
- Cron diário de alertas por e-mail com dedup via `notification_log`

## Fase 2 — Premium

Implementado:

- Billing Stripe: checkout de upgrade, billing portal, webhook (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`)
- Limites por plano (Free: 5 assinaturas e alerta 1 dia antes; Premium: ilimitado e 1/3/7 dias)
- Insights Premium: gráfico de evolução nos últimos 6 meses, delta mês a mês, sugestões automáticas
- Exportar assinaturas em CSV
- Página `/settings` com perfil, preferências de notificação, gerenciamento de plano e exclusão de conta

## Setup local

### 1. Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (free tier serve)
- Conta no [Resend](https://resend.com) (free tier serve)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com).
2. No SQL Editor, cole o conteúdo de `supabase/migrations/001_initial.sql` e execute.
3. Em `Authentication → Providers`, habilite:
   - **Google** (crie credenciais OAuth no [Google Cloud Console](https://console.cloud.google.com), defina `https://<seu-projeto>.supabase.co/auth/v1/callback` como Redirect URI)
   - **Email** (magic link já vem habilitado)
4. Em `Authentication → URL Configuration`, adicione `http://localhost:3000` em Site URL e `http://localhost:3000/callback` em Additional Redirect URLs.

### 4. Configurar Stripe (Fase 2)

1. Em test mode no [dashboard.stripe.com](https://dashboard.stripe.com/test/products), crie um produto **Subsly Premium** com preço **R$ 9,90/mês** (BRL recorrente).
2. Copie o `price_id` (formato `price_...`) para `STRIPE_PRICE_ID`.
3. Em [API keys](https://dashboard.stripe.com/test/apikeys), pegue `STRIPE_SECRET_KEY` (`sk_test_...`) e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`).
4. **Webhook local:** instale o [Stripe CLI](https://stripe.com/docs/stripe-cli) e rode:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   O CLI imprime um `whsec_...` — cole em `STRIPE_WEBHOOK_SECRET`.
5. **Webhook em produção:** após deploy na Vercel, em [Webhooks](https://dashboard.stripe.com/test/webhooks) crie um endpoint apontando pra `https://<seu-app>.vercel.app/api/webhooks/stripe` selecionando os eventos `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`. Copie o signing secret pra `STRIPE_WEBHOOK_SECRET` no Vercel.
6. **Test cards:** use `4242 4242 4242 4242` (sucesso) ou `4000 0000 0000 0341` (falha em recurring). Qualquer CVC, qualquer data futura.

### 5. Configurar Resend

1. Verifique seu domínio em [resend.com/domains](https://resend.com/domains).
2. Gere uma API key em [resend.com/api-keys](https://resend.com/api-keys).
3. Ajuste `RESEND_FROM_EMAIL` no `.env.local` pra um e-mail do domínio verificado.

### 6. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=alertas@seu-dominio.com.br

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=<string-aleatória-longa>
```

### 7. Rodar

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Deploy na Vercel

1. Faça push pro GitHub.
2. Importe o projeto no [vercel.com/new](https://vercel.com/new).
3. Configure todas as variáveis de ambiente em `Project Settings → Environment Variables`.
4. O `vercel.json` já registra o cron em `/api/cron/notify` rodando diariamente às 11h UTC (≈ 08h BRT).
5. Atualize `NEXT_PUBLIC_APP_URL` pro domínio de produção e adicione o callback nos providers OAuth.

### Testar o cron localmente

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify
```

## Estrutura

```
src/
├── app/
│   ├── (auth)/login         # login Google + magic link
│   ├── (auth)/callback      # OAuth/OTP code exchange
│   ├── (dashboard)/
│   │   ├── dashboard        # resumo principal
│   │   ├── subscriptions    # CRUD com modal
│   │   └── insights         # analytics
│   ├── api/
│   │   ├── subscriptions    # CRUD
│   │   └── cron/notify      # cron diário
│   ├── layout.tsx
│   └── page.tsx             # landing
├── components/
│   ├── ui/                  # button, input, card, modal, badge, select, textarea, label
│   ├── dashboard-shell.tsx
│   ├── subscription-card.tsx
│   ├── subscription-form.tsx
│   ├── pricing-section.tsx
│   ├── upcoming-alerts.tsx
│   └── category-bar.tsx
├── lib/
│   ├── supabase/            # client, server, middleware
│   ├── constants.ts         # categorias, ciclos, limites
│   ├── utils.ts             # cálculos de data, formatação
│   ├── validations.ts       # zod
│   ├── resend.ts
│   └── email-templates.ts
└── types/index.ts
supabase/migrations/001_initial.sql
```

## Fase 3 — Diferenciação

Implementado:

- **PWA**: `manifest.webmanifest`, service worker (`/sw.js`) com cache shell + handler de push, install prompt no dashboard
- **Web Push**: opt-in em `/settings`, integração no cron (envia push junto com e-mail), endpoints `POST/DELETE /api/push/subscribe`
- **Catálogo de serviços**: ~40 serviços brasileiros populares com autocomplete ao digitar no form
- **Compartilhamento**: campo "dividida com N pessoas" no form; valor mostrado em cards, dashboard e insights usa o **custo real** (preço ÷ pessoas); CSV inclui colunas `dividida_por` e `custo_real`
- **Dark / light / system**: CSS variables + Tailwind dinâmico, script anti-FOUC inline, toggle em `/settings`, persistido em `profiles.theme`
- **i18n pt-BR / en**: provider client-side com dicionário, toggle em `/settings`, persistido em `profiles.locale` (cobertura parcial — nav, dashboard e settings)

> Não implementado: detecção automática via Gmail OAuth (deixada pra próxima fase por escolha).

### Setup adicional Fase 3

1. **Rodar a migration 002** no SQL Editor do Supabase (`supabase/migrations/002_phase3.sql`) — adiciona `shared_count`, tabela `push_subscriptions`, colunas `notification_push`, `locale`, `theme`.

2. **Gerar VAPID keys** pra Web Push (uma única vez):

   ```bash
   npx web-push generate-vapid-keys
   ```

   Cole o output em `.env.local`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxxxxxxxxxx
   VAPID_PRIVATE_KEY=xxxxxxxxxx
   VAPID_SUBJECT=mailto:contato@subsly.com.br
   ```

3. **Ícones PWA (opcional)**: o SVG em `public/icons/icon.svg` funciona em navegadores modernos. Pra cobertura total (iOS, Android antigos), gere PNGs 192×192 e 512×512 e coloque em `public/icons/icon-192.png` e `icon-512.png` — o manifest já aponta pra eles.

## Próximos passos

- Detecção automática de assinaturas via Gmail OAuth (opt-in)
- Migração de mais strings para i18n
- Catálogo expandido com logos reais (atualmente só nome + emoji da categoria)
