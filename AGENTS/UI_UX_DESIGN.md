# UI/UX Design Guidelines

The frontend must deliver a premium, modern, minimalistic experience. These guidelines are non-negotiable. All agents building UI components must adhere to them strictly.

---

## 1. Theme & Aesthetic Philosophy

*   **Modern Minimalism:** Exceptionally clean, professional, and uncluttered. Remove every element that doesn't serve the user. No decorative borders, no heavy drop shadows, no visual noise.
*   **White Space (Negative Space):** The primary design tool. Components must have generous padding and margins. Content must breathe. Density should be low on primary views and moderate on data-heavy tables — never cramped.
*   **Consistency:** The same component used in two places must look and behave identically. Use the shared `components/ui/` primitives — never one-off styled elements.
*   **Micro-interactions:** Hover states, smooth transitions (`transition-all duration-200`), skeleton loaders, and subtle focus rings make the UI feel alive and professional. All interactive elements must have visible hover/focus states.
*   **Accessibility (a11y):** All interactive elements must be keyboard-navigable. All images/icons must have `alt` text or `aria-label`. Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<form>`, `<table>`). Minimum contrast ratio: 4.5:1 for body text.

---

## 2. Typography

*   **Font Family:** `Inter` (primary). Import from Google Fonts. Set as the default sans-serif in `tailwind.config.ts`.
*   **Font Scale (Tailwind classes):**

| Role | Class | Weight |
|---|---|---|
| Page Title (h1) | `text-2xl` or `text-3xl` | `font-bold` (700) |
| Section Heading (h2) | `text-xl` | `font-semibold` (600) |
| Card Title (h3) | `text-base` or `text-lg` | `font-semibold` (600) |
| Body / Labels | `text-sm` | `font-normal` (400) |
| Helper / Caption | `text-xs` | `font-normal` (400) |

---

## 3. Color Palette

All colors are defined as CSS custom properties in `globals.css` and configured as Tailwind theme tokens. Agents must use these token names, not raw hex values in components.

### Base Tokens
| Token Name | Hex Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#FFFFFF` | Page backgrounds |
| `--color-bg-secondary` | `#F9FAFB` | Sidebar, card backgrounds |
| `--color-bg-subtle` | `#F3F4F6` | Table row hover, input backgrounds |
| `--color-border` | `#E5E7EB` | All borders, dividers |

### Text Tokens
| Token Name | Hex Value | Usage |
|---|---|---|
| `--color-text-primary` | `#111827` | Headings, primary body text |
| `--color-text-secondary` | `#374151` | Secondary text, labels |
| `--color-text-muted` | `#6B7280` | Placeholder, captions, metadata |

### Accent (Primary Action)
| Token Name | Hex Value | Usage |
|---|---|---|
| `--color-accent` | `#4F46E5` | Primary buttons, active nav links, focus rings |
| `--color-accent-hover` | `#4338CA` | Button hover state |
| `--color-accent-light` | `#EEF2FF` | Accent badge backgrounds, tag chips |

### Status Colors (Subtle — not harsh)
| Status | Token | Background | Text |
|---|---|---|---|
| Submitted / Success | `--color-success` | `#D1FAE5` | `#065F46` |
| Pending / Warning | `--color-warning` | `#FEF3C7` | `#92400E` |
| Late / Error | `--color-error` | `#FEE2E2` | `#991B1B` |
| Draft / Neutral | `--color-neutral` | `#F3F4F6` | `#374151` |

---

## 4. Component Specifications

### Buttons
*   **Primary:** `bg-accent text-white rounded-lg px-4 py-2 font-medium hover:bg-accent-hover transition-colors`
*   **Secondary/Ghost:** `border border-border text-text-secondary rounded-lg px-4 py-2 hover:bg-bg-subtle`
*   **Danger:** `bg-error-bg text-error rounded-lg px-4 py-2` (use only for destructive actions)
*   All buttons must have `disabled:opacity-50 disabled:cursor-not-allowed` states.

### Form Inputs
*   Consistent height, `rounded-lg`, `border border-border`.
*   On focus: `ring-2 ring-accent ring-offset-1` (no harsh outlines, just the ring).
*   Error state: `border-error` with a helper text below in `text-error text-xs`.
*   All inputs must have an associated visible `<label>`.

### Cards
*   `bg-white rounded-xl border border-border p-6` — Clean, borderless feel with just a subtle border.
*   No heavy box shadows. Use `shadow-sm` at most.

### Status Badges
*   Use the status color tokens above. `rounded-full px-2.5 py-0.5 text-xs font-medium`.
*   Three states: `SUBMITTED` (green), `DRAFT`/`PENDING` (amber), `LATE` (red).

### Data Tables (Manager Dashboard)
*   Use a clean `<table>` with `thead` and `tbody`. No heavy borders on rows.
*   Use `border-b border-border` on `<tr>` for a subtle separator.
*   Header row: `bg-bg-secondary text-text-muted text-xs uppercase tracking-wider`.
*   Zebra striping: Use row hover (`hover:bg-bg-subtle`) instead of alternating row colors.
*   Ensure tables are horizontally scrollable on mobile: `overflow-x-auto`.

---

## 5. Page-Level Layout Specifications

### Login / Register Page
*   Centered card layout on a `bg-bg-secondary` full-page background.
*   Single column form, generous vertical spacing between fields.
*   The app logo/name above the form.

### Team Member — Personal Report Page
*   Full-width page with a top navbar.
*   Left side: Report form (fixed fields, no customization) in a Card.
*   Right side / Below: Past report history list, organized by week (most recent first).

### Manager — Team Dashboard Page
*   Sidebar navigation (collapsible on mobile) + main content area.
*   **Top section:** 3 metric cards in a grid (`grid-cols-1 md:grid-cols-3`).
*   **Middle section:** 2–3 Recharts charts side by side.
*   **Bottom section:** Filterable data table of all team reports.
*   **Floating chat widget:** Bottom-right corner, toggleable AI assistant panel (Bonus).

### Navigation (Sidebar / Navbar)
*   Active link must be visually distinct: `bg-accent-light text-accent font-medium`.
*   Inactive links: `text-text-secondary hover:bg-bg-subtle`.

---

## 6. Responsiveness

*   Mobile-first approach. Build for small screens first, use Tailwind breakpoints (`sm:`, `md:`, `lg:`) to expand.
*   The Manager Sidebar collapses to a hamburger menu on `md` and below.
*   Charts must be wrapped in a responsive container (`ResponsiveContainer` from Recharts).
*   All data tables must be wrapped in `overflow-x-auto`.
