import type { Theme } from '@/types';

export const THEME_KEY = 'subgenie:theme';

export function resolveTheme(t: Theme): 'dark' | 'light' {
  if (t === 'system') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }
  return t;
}

export function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(t);
  document.documentElement.classList.toggle('light', resolved === 'light');
}

/** Script inline pra rodar antes do paint, evitando FOUC. */
export const THEME_INIT_SCRIPT = `
(function(){try{
  var s=localStorage.getItem('${THEME_KEY}')||'dark';
  var t=s;
  if(s==='system'){
    t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
  }
  if(t==='light')document.documentElement.classList.add('light');
}catch(e){}})();
`.trim();
