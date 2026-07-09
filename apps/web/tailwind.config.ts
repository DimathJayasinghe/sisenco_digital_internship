import type { Config } from 'tailwindcss';

// Light+dark neo-brutalism (AGENTS/UI_UX_DESIGN.md). Colors come straight
// from Tailwind's stock zinc/violet/emerald/red/amber scales — no custom
// hex/variable token layer. Theme toggling uses Tailwind's `class` strategy
// (a `.dark` class on <html>, flipped by hooks/useTheme.ts) — every themed
// class in a component is a `<light> dark:<dark>` pair.
//
// The only non-stock additions are the hard-offset "brutal" shadows below
// (Tailwind has no built-in for a blur-less offset shadow). Only the
// *neutral* (zinc) shadow needs a light/dark pair — the violet/red emphasis
// shadows use the same accent hex in both themes, so they don't.
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Neutral — default resting state for cards/secondary buttons.
        // Light default: zinc-900 offset (mirrors the light structural border).
        brutal: '4px 4px 0 0 #18181b',
        'brutal-lg': '6px 6px 0 0 #18181b',
        'brutal-sm': '2px 2px 0 0 #18181b',
        // Dark-mode counterparts (zinc-100 offset) — apply via `dark:shadow-brutal-dark` etc.
        'brutal-dark': '4px 4px 0 0 #f4f4f5',
        'brutal-lg-dark': '6px 6px 0 0 #f4f4f5',
        'brutal-sm-dark': '2px 2px 0 0 #f4f4f5',
        // Violet — primary/focus emphasis. Same hex in both themes.
        'brutal-violet': '4px 4px 0 0 #7c3aed',
        'brutal-violet-sm': '2px 2px 0 0 #8b5cf6',
        // Red — danger emphasis. Same hex in both themes.
        'brutal-red': '4px 4px 0 0 #dc2626',
        'brutal-red-sm': '2px 2px 0 0 #ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
