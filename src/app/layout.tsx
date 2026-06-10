import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SubGenie — Pare de pagar por assinaturas que você não usa',
    template: '%s | SubGenie',
  },
  description:
    'Centralize suas assinaturas, receba alertas antes da cobrança e descubra pra onde vai seu dinheiro todo mês.',
  keywords: [
    'assinaturas',
    'gestor de assinaturas',
    'controle financeiro',
    'streaming',
    'finanças pessoais',
    'subscription manager',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'SubGenie',
    title: 'SubGenie — Gestor pessoal de assinaturas',
    description:
      'Descubra pra onde vai seu dinheiro todo mês e pare de pagar por coisas que você nem usa.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubGenie — Gestor pessoal de assinaturas',
    description:
      'Centralize suas assinaturas e receba alertas antes da cobrança.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'SubGenie',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport = {
  themeColor: '#0a0a14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${jetBrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
