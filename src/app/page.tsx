import Link from 'next/link';
import { PricingSection } from '@/components/pricing-section';
import { Card } from '@/components/ui/card';

const features = [
  {
    emoji: '📊',
    title: 'Tudo num lugar só',
    description:
      'Streaming, academia, apps, jogos — todas suas assinaturas centralizadas.',
  },
  {
    emoji: '⏰',
    title: 'Alertas antes da cobrança',
    description:
      'Receba e-mail dias antes de cada débito. Nada de surpresa na fatura.',
  },
  {
    emoji: '💡',
    title: 'Insights de verdade',
    description:
      'Veja quanto gasta por categoria e descubra onde está desperdiçando.',
  },
  {
    emoji: '🔒',
    title: 'Seus dados, seus',
    description:
      'Sem conexão com banco. Você controla o que entra e quando excluir.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-input bg-accent text-white font-bold">
              S
            </div>
            <span className="text-lg font-bold text-text-primary">Subsly</span>
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="#precos"
              className="hidden text-sm text-text-secondary hover:text-text-primary sm:inline"
            >
              Preços
            </a>
            <Link
              href="/login"
              className="rounded-input bg-accent hover:bg-accent-hover px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-chip border border-border bg-bg-card px-3 py-1 text-xs text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
            Grátis pra começar, sem cartão
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-6xl">
            Descubra pra onde vai seu{' '}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              dinheiro
            </span>{' '}
            todo mês.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary md:text-xl">
            Centralize todas suas assinaturas, receba alertas antes das
            cobranças e pare de pagar por coisas que você nem usa.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="w-full rounded-input bg-accent hover:bg-accent-hover px-6 py-3 text-center font-medium text-white transition-colors sm:w-auto"
            >
              Comece grátis →
            </Link>
            <a
              href="#features"
              className="w-full rounded-input border border-border bg-bg-card hover:bg-[#1d1d35] px-6 py-3 text-center font-medium text-text-primary transition-colors sm:w-auto"
            >
              Ver como funciona
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary md:text-4xl">
            Tudo que você precisa pra parar de gastar mal
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title}>
                <div className="mb-3 text-3xl">{f.emoji}</div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* CTA */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">
            Pronto pra retomar o controle?
          </h2>
          <p className="mb-8 text-text-secondary">
            Leva menos de 1 minuto pra cadastrar suas primeiras assinaturas.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-input bg-accent hover:bg-accent-hover px-6 py-3 font-medium text-white transition-colors"
          >
            Comece grátis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-text-secondary md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-bold text-white">
              S
            </div>
            <span>© {new Date().getFullYear()} Subsly</span>
          </div>
          <div className="flex gap-4">
            <a href="#precos" className="hover:text-text-primary">
              Preços
            </a>
            <a href="mailto:contato@subsly.com.br" className="hover:text-text-primary">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
