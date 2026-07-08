import type { Config } from 'tailwindcss';

// Dark-mode-only system (AGENTS/UI_UX_DESIGN.md). Colors come straight from
// Tailwind's stock zinc/violet/emerald/red/amber scales — no custom token
// layer. Reference classes directly in components (bg-zinc-950,
// text-violet-400, ...), never introduce a parallel hex/variable system.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
