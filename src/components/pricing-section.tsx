import Link from 'next/link';
import { Card } from '@/components/ui/card';

const tiers = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/sempre',
    description: 'Pra começar a organizar suas assinaturas.',
    features: [
      'Até 5 assinaturas',
      'Alertas por e-mail (1 dia antes)',
      'Insights básicos',
      'Tema escuro',
    ],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Premium',
    price: 'R$ 9,90',
    period: '/mês',
    description: 'Pra quem leva o controle a sério.',
    features: [
      'Assinaturas ilimitadas',
      'Alertas em 1, 3 e 7 dias antes',
      'Insights completos com tendências',
      'Exportar dados em CSV',
      'Suporte prioritário',
    ],
    cta: 'Assinar Premium',
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section id="precos" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-text-primary md:text-4xl">
            Comece grátis. Suba quando precisar.
          </h2>
          <p className="text-text-secondary">
            Sem cartão de crédito pra começar. Cancele quando quiser.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlight
                  ? 'border-accent/40 bg-gradient-to-b from-accent/10 to-bg-card relative'
                  : ''
              }
            >
              {tier.highlight && (
                <div className="absolute -top-3 right-5 rounded-chip border border-accent/40 bg-accent px-3 py-0.5 text-xs font-semibold text-white">
                  Recomendado
                </div>
              )}
              <h3 className="mb-1 text-xl font-bold text-text-primary">
                {tier.name}
              </h3>
              <p className="mb-5 text-sm text-text-secondary">
                {tier.description}
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-bold text-text-primary">
                  {tier.price}
                </span>
                <span className="text-text-secondary">{tier.period}</span>
              </div>
              <ul className="mb-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-primary"
                  >
                    <span className="mt-0.5 text-success">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={
                  tier.highlight
                    ? 'block w-full rounded-input bg-accent hover:bg-accent-hover px-4 py-2.5 text-center text-sm font-medium text-white transition-colors duration-150'
                    : 'block w-full rounded-input border border-border bg-bg-card hover:bg-[#1d1d35] px-4 py-2.5 text-center text-sm font-medium text-text-primary transition-colors duration-150'
                }
              >
                {tier.cta}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
