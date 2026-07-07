import type { Config } from 'tailwindcss';

// Design tokens are defined as CSS custom properties in globals.css and surfaced
// here as Tailwind theme tokens. Components use token names, never raw hex.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          subtle: 'var(--color-bg-subtle)',
        },
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          light: 'var(--color-accent-light)',
        },
        success: {
          bg: 'var(--color-success-bg)',
          fg: 'var(--color-success-fg)',
        },
        warning: {
          bg: 'var(--color-warning-bg)',
          fg: 'var(--color-warning-fg)',
        },
        error: {
          bg: 'var(--color-error-bg)',
          fg: 'var(--color-error-fg)',
        },
        neutral: {
          bg: 'var(--color-neutral-bg)',
          fg: 'var(--color-neutral-fg)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
