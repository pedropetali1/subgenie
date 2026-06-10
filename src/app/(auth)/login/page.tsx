import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const metadata = {
  title: 'Entrar',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-input bg-accent text-white font-bold">
              S
            </div>
            <span className="text-lg font-bold text-text-primary">SubGenie</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense fallback={<div className="text-text-secondary">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
