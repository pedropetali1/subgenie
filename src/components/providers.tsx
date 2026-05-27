'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { applyTheme, THEME_KEY } from '@/lib/theme';
import { t as translate, type MessageKey } from '@/i18n/messages';
import type { Locale, Theme } from '@/types';

const LOCALE_KEY = 'subsly:locale';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}
interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
}

const ThemeContext = createContext<ThemeCtx | null>(null);
const LocaleContext = createContext<LocaleCtx | null>(null);

interface ProvidersProps {
  initialTheme?: Theme;
  initialLocale?: Locale;
  children: React.ReactNode;
}

export function Providers({
  initialTheme = 'dark',
  initialLocale = 'pt-BR',
  children,
}: ProvidersProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    // Sincroniza com localStorage (se mais recente que o server-side)
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (storedTheme && storedTheme !== theme) setThemeState(storedTheme);
    const storedLocale = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (storedLocale && storedLocale !== locale) setLocaleState(storedLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
  }, [locale]);

  // Atualiza se "system" e preferência muda
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const themeValue = useMemo(
    () => ({ theme, setTheme: setThemeState }),
    [theme],
  );

  const t = useCallback(
    (key: MessageKey) => translate(locale, key),
    [locale],
  );

  const localeValue = useMemo(
    () => ({ locale, setLocale: setLocaleState, t }),
    [locale, t],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <LocaleContext.Provider value={localeValue}>
        {children}
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme fora de Providers');
  return ctx;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale fora de Providers');
  return ctx;
}
