import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'rgb(var(--bg-primary) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          input: 'rgb(var(--bg-input) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#6C5CE7',
          hover: '#a855f7',
        },
        success: '#1DB954',
        warning: '#ff8c00',
        danger: '#ff4444',
        category: {
          streaming: '#E50914',
          music: '#1DB954',
          gaming: '#7B2FBE',
          fitness: '#FF6B35',
          cloud: '#0078D4',
          food: '#FF3008',
          news: '#1A73E8',
          education: '#F4B400',
          productivity: '#00B4D8',
          finance: '#10B981',
          other: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        chip: '20px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
