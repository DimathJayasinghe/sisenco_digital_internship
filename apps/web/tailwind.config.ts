import type { Config } from 'tailwindcss';

// Dark-mode neo-brutalism (AGENTS/UI_UX_DESIGN.md). Colors come straight
// from Tailwind's stock zinc/violet/emerald/red/amber scales — no custom
// hex/variable token layer. The only additions are the hard-offset "brutal"
// shadows below (Tailwind has no built-in for a blur-less offset shadow) —
// reference classes directly elsewhere (bg-zinc-950, text-violet-400, ...).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Neutral (zinc-100) — default resting state for cards/secondary buttons.
        brutal: '4px 4px 0 0 #f4f4f5',
        'brutal-lg': '6px 6px 0 0 #f4f4f5',
        'brutal-sm': '2px 2px 0 0 #f4f4f5',
        // Violet — primary/focus emphasis.
        'brutal-violet': '4px 4px 0 0 #7c3aed',
        'brutal-violet-sm': '2px 2px 0 0 #8b5cf6',
        // Red — danger emphasis.
        'brutal-red': '4px 4px 0 0 #dc2626',
        'brutal-red-sm': '2px 2px 0 0 #ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
