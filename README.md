# SubGenie

Gestor pessoal de assinaturas — centraliza streaming, apps, academia e tudo mais num lugar só, com alertas antes da cobrança e insights de gasto.

## Description

O SubGenie resolve o problema de pagar por assinaturas esquecidas. Você cadastra suas assinaturas (ou escolhe de um catálogo de ~40 serviços brasileiros), e o app calcula gasto mensal e anual, mostra as próximas cobranças, manda alertas por e-mail e push antes de cada renovação, e ainda diz **onde e como cancelar** cada uma — App Store, Google Play ou a URL oficial do serviço.

É um PWA construído em Next.js 14 (App Router) + TypeScript, com Supabase para auth e banco, Stripe para o plano Premium, Resend para e-mails e Web Push para notificações. Tem tema claro/escuro, i18n pt-BR/en e exportação em CSV.

Principais recursos:

- Dashboard com gasto mensal, anual, próximos 7 dias e lista de cobranças próximas
- CRUD de assinaturas com filtro, ordenação, autocomplete de catálogo e "dividida com N pessoas"
- Insights: breakdown por categoria, mais cara, preço médio e (Premium) evolução de 6 meses com sugestões
- Alertas diários por e-mail e Web Push, com dedup e dica de cancelamento
- Plano Premium via Stripe (checkout, billing portal, webhooks)
- PWA instalável, tema claro/escuro/sistema e i18n pt-BR/en

## Getting Started

### Dependencies

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (free tier serve) — PostgreSQL + Auth
- Conta no [Resend](https://resend.com) (free tier serve) — e-mails transacionais
- Conta no [Stripe](https://stripe.com) (test mode serve) — billing do plano Premium
- Conta na [Vercel](https://vercel.com) para deploy + Vercel Cron (opcional em dev)

### Installing

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/pedropetali1/subgenie.git
   cd subgenie
   npm install
   ```

2. **Supabase:** crie um projeto novo em [supabase.com](https://supabase.com) e, no SQL Editor, rode as migrations na ordem: `supabase/migrations/001_initial.sql`, `002_phase3.sql`, `003_billing_source.sql`.
   - Em `Authentication → Providers`, habilite **Google** (com credenciais OAuth do [Google Cloud Console](https://console.cloud.google.com) e o Redirect URI `https://<seu-projeto>.supabase.co/auth/v1/callback`) e **Email** (magic link já vem ligado).
   - Em `Authentication → URL Configuration`, adicione `http://localhost:3000` em Site URL e `http://localhost:3000/callback` em Additional Redirect URLs.

3. **Stripe (plano Premium):** em test mode, crie um produto **SubGenie Premium** a **R$ 9,90/mês** (BRL recorrente) e copie o `price_id`. Pegue as chaves em [API keys](https://dashboard.stripe.com/test/apikeys). Para o webhook local, instale o [Stripe CLI](https://stripe.com/docs/stripe-cli) e rode `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — ele imprime o `whsec_...`. Test cards: `4242 4242 4242 4242` (sucesso), `4000 0000 0000 0341` (falha em recurring).

4. **Resend:** verifique seu domínio em [resend.com/domains](https://resend.com/domains) e gere uma API key em [resend.com/api-keys](https://resend.com/api-keys).

5. **Web Push (opcional):** gere as chaves VAPID uma única vez com `npx web-push generate-vapid-keys`.

6. **Variáveis de ambiente:** copie `.env.example` para `.env.local` e preencha:

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

   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxxxxxxxxxx
   VAPID_PRIVATE_KEY=xxxxxxxxxx
   VAPID_SUBJECT=mailto:contato@subgenie.com.br

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CRON_SECRET=<string-aleatória-longa>
   ```

### Executing program

- Rodar em desenvolvimento:

  ```bash
  npm run dev
  ```

  Abra `http://localhost:3000`.

- Build de produção:

  ```bash
  npm run build
  npm run start
  ```

- Testar o cron de alertas localmente:

  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify
  ```

## Help

- **Login OAuth ou `/callback` quebrando:** confira a Site URL e as Additional Redirect URLs em `Authentication → URL Configuration` no Supabase — precisam bater com a URL do ambiente (localhost em dev, domínio real em produção).
- **Cron retorna 401:** o header `Authorization: Bearer <CRON_SECRET>` não bate com a env `CRON_SECRET`, ou ela não está cadastrada na Vercel.
- **Webhook do Stripe ignorado:** o `STRIPE_WEBHOOK_SECRET` precisa ser o `whsec_...` do endpoint **daquele** ambiente (o do CLI em dev, o do dashboard em produção).
- **E-mails não chegam:** o domínio do `RESEND_FROM_EMAIL` precisa estar verificado no Resend.

No deploy da Vercel, lembre que o `.env.local` **não** sobe — cadastre todas as variáveis (com **valores de produção**) em Project Settings → Environment Variables, e use chaves Stripe **live** e a `NEXT_PUBLIC_APP_URL` com a URL real (nunca `localhost`). O `vercel.json` já registra o cron em `/api/cron/notify` diariamente (≈ 08h BRT); cron diário funciona no plano Hobby.

## Authors

Pedro Lucas Teixeira
[@pedropetali1](https://github.com/pedropetali1) — pedrolucasteixeirap@gmail.com

## Version History

- 0.3 — Fase 3 (Diferenciação)
    - PWA instalável, Web Push, catálogo de serviços, compartilhamento, tema claro/escuro/sistema e i18n pt-BR/en
- 0.2 — Fase 2 (Premium)
    - Billing Stripe, limites por plano, insights Premium, exportação CSV, página `/settings` e cancelamento dinâmico
- 0.1 — Fase 1 (MVP)
    - Landing page, auth Google + magic link, dashboard, CRUD de assinaturas, insights e cron de alertas por e-mail

## License

This project is licensed under the MIT License — see the LICENSE.md file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Resend](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
