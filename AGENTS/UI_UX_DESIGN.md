# UI/UX Design Guidelines

The frontend must deliver a premium, modern **dark-mode** experience — a monochromatic zinc canvas, glass-edged surfaces defined by micro-borders instead of shadows, and a single saturated violet accent used deliberately. These guidelines are non-negotiable. All agents building UI components must adhere to them strictly.

**Scope decision:** this system is designed **dark-mode only**. Nothing in the brief called for a light theme, and maintaining two parallel token sets (and re-verifying contrast for both) is scope not asked for. If a light mode is wanted later, flag it — it's a new design pass, not a toggle.

---

## 1. Theme & Aesthetic Philosophy

- **Monochromatic base, one accent.** The zinc scale carries almost the entire UI. Violet is spent deliberately — primary actions, active states, key metrics — never decoratively. If everything is accented, nothing is.
- **Depth from borders, not shadows.** No `shadow-lg`, no blurred drop shadows anywhere. Elevation is communicated with `border-white/10` micro-borders and a one-step-lighter fill (`bg-white/5` over `bg-zinc-950`). This is what makes the UI read as "glass" rather than "flat."
- **Density is a deliberate, role-specific choice**, not an accident of not-caring. The Team Member surface is spacious and focused; the Manager surface is dense and information-rich. Neither is "the default" — each is tuned to what that role is doing. See §6.
- **Consistency.** The same component used in two places looks and behaves identically. Use the shared `components/ui/` primitives — never one-off styled elements.
- **Micro-interactions.** Hover and focus states on every interactive element, `transition-colors duration-150` (fast — this isn't a decorative animation system, it's just enough to not feel like a hard cut). Buttons darken on hover (see §5, and the contrast rationale below) rather than lighten.
- **Accessibility is load-bearing, not a checklist item.** Every color pair below was run through the actual WCAG 2.1 relative-luminance formula, not eyeballed. See §9 for the verified numbers and the rules they produce.

---

## 2. Color System

All colors are Tailwind's stock `zinc` and `violet`/`emerald`/`red`/`amber` scales — no custom hex values. Reference them by Tailwind class, not hex, in components.

### Base (zinc)

| Token                  | Tailwind class    | Hex       | Usage                                                                                             |
| ---------------------- | ----------------- | --------- | ------------------------------------------------------------------------------------------------- |
| Canvas                 | `bg-zinc-950`     | `#09090b` | Page background, the base layer everything sits on                                                |
| Surface                | `bg-zinc-900`     | `#18181b` | Solid card/widget fill where a glass surface would be too transparent (e.g. sticky table headers) |
| Surface (glass)        | `bg-white/5`      | —         | Default card/container fill — translucent white over the canvas, per §1                           |
| Surface (glass, hover) | `bg-white/[0.07]` | —         | Hover state for glass surfaces                                                                    |
| Border (glass)         | `border-white/10` | —         | Default card/container border                                                                     |
| Border (glass, hover)  | `border-white/15` | —         | Hover state for glass borders                                                                     |
| Border (solid)         | `border-zinc-800` | `#27272a` | Dividers, table row separators, borders on solid `zinc-900` surfaces                              |

### Text

| Token            | Tailwind class  | Hex       | Usage                                                    | Contrast on `zinc-950` |
| ---------------- | --------------- | --------- | -------------------------------------------------------- | ---------------------- |
| Primary          | `text-zinc-100` | `#f4f4f5` | Headings, primary content                                | 18.1:1                 |
| Body             | `text-zinc-300` | `#d4d4d8` | Regular body copy, form values                           | 13.5:1                 |
| Secondary        | `text-zinc-400` | `#a1a1aa` | Captions, table headers, helper text, labels             | 7.8:1                  |
| Placeholder only | `text-zinc-500` | `#71717a` | Input placeholders **only** — see §9, fails body-text AA | 4.1:1                  |

`zinc-500` and anything darker (`zinc-600`+) must never be used for real text (labels, captions, disabled-but-legible content) — see §9's verified failure. `zinc-500` is placeholder-only, where WCAG's text criteria don't apply the same way.

### Accent — Violet

| Token          | Tailwind class     | Hex       | Usage                                                            |
| -------------- | ------------------ | --------- | ---------------------------------------------------------------- |
| Primary        | `bg-violet-600`    | `#7c3aed` | Primary button fill, active nav indicator                        |
| Primary hover  | `bg-violet-700`    | `#6d28d9` | Primary button **hover** — darkens, doesn't lighten (§9)         |
| Primary active | `bg-violet-800`    | `#5b21b6` | Primary button pressed state                                     |
| Accent text    | `text-violet-400`  | `#a78bfa` | Links, active nav text, hero-metric emphasis on dark backgrounds |
| Accent tint    | `bg-violet-500/10` | —         | Active nav item background, subtle accent chips                  |

### Status (Report Lifecycle)

Same translucent-badge pattern throughout: `text-{color}-400` on `bg-{color}-500/10` with a `border-{color}-500/20` hairline. `DRAFT` is the odd one out — it's inactive, not "colored," so it's solid zinc rather than tinted.

| Status      | Text               | Background          | Border                  |
| ----------- | ------------------ | ------------------- | ----------------------- |
| `SUBMITTED` | `text-emerald-400` | `bg-emerald-500/10` | `border-emerald-500/20` |
| `LATE`      | `text-red-400`     | `bg-red-500/10`     | `border-red-500/20`     |
| `PENDING`   | `text-amber-400`   | `bg-amber-500/10`   | `border-amber-500/20`   |
| `DRAFT`     | `text-zinc-400`    | `bg-zinc-800`       | `border-zinc-700`       |

All four verified well above AA against `zinc-900` (emerald 9.2:1, red 6.4:1, amber 10.6:1) — see §9.

---

## 3. Typography

- **Font:** `Inter`, loaded via `next/font/google` (not a `<link>` tag — avoids a render-blocking request and gets automatic font-display optimization). `Geist` is an acceptable drop-in swap if preferred later; the type scale below doesn't change either way.
- **Numerals:** apply `tabular-nums` (`font-variant-numeric: tabular-nums`, or Tailwind's `tabular-nums` class) to anything with stacked/aligned numbers — dashboard metric cards, table columns of hours/counts, dates. Without it, proportional digit widths make columns visibly wobble.

| Role                         | Class                                                        | Notes                                                                             |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Hero metric (dashboard stat) | `text-4xl md:text-5xl font-bold tracking-tight tabular-nums` | The "premium condensed" number treatment — compliance rate, total submitted, etc. |
| Page title (h1)              | `text-2xl md:text-3xl font-semibold tracking-tight`          |                                                                                   |
| Section heading (h2)         | `text-lg md:text-xl font-semibold`                           |                                                                                   |
| Card title (h3)              | `text-base font-semibold`                                    |                                                                                   |
| Body                         | `text-sm text-zinc-300`                                      | Default for form values, paragraph content                                        |
| Table / dense data           | `text-xs md:text-sm`                                         | Manager view — see §6                                                             |
| Label                        | `text-sm font-medium text-zinc-300`                          | Form field labels                                                                 |
| Caption / helper             | `text-xs text-zinc-400`                                      | Never `zinc-500` — see §9                                                         |

---

## 4. Spacing, Depth & Elevation

No `shadow-*` utilities anywhere in the primitive components. Elevation is entirely border + fill based:

- **Default card:** `bg-white/5 border border-white/10 rounded-xl`
- **Hover state:** `hover:bg-white/[0.07] hover:border-white/15` — a one-step lift, not a color change
- **Solid alternative** (sticky headers, or any surface that needs a fully opaque backdrop): `bg-zinc-900 border border-zinc-800 rounded-xl`
- **Dividers:** `border-zinc-800` for solid contexts, `border-white/10` for glass contexts
- **Focus ring:** `ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-950` — the offset color **must** match the actual background (`zinc-950`, or `zinc-900` inside a solid card); a white/default offset ring looks like a bug on a dark canvas.

### Radius

| Element                    | Class               |
| -------------------------- | ------------------- |
| Cards, containers, modals  | `rounded-xl` (12px) |
| Buttons, inputs, dropdowns | `rounded-lg` (8px)  |
| Badges, pills, avatars     | `rounded-full`      |

---

## 5. Component Specifications

### Buttons

- **Primary:** `bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-medium rounded-lg px-4 py-2 transition-colors`
- **Secondary:** `bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-medium rounded-lg px-4 py-2 transition-colors`
- **Ghost:** `text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg px-4 py-2 transition-colors` — no border
- **Danger:** `bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2` (destructive actions only — deactivating a project, etc.)
- All buttons: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`
- Focus: `focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`

### Form Inputs

- `bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500`
- Focus: `focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 focus:outline-none`
- Error: `border-red-500/50` with helper text `text-red-400 text-xs mt-1.5`
- Every input has a visible `<label className="text-sm font-medium text-zinc-300">` — never placeholder-as-label.

### Cards

- `bg-white/5 border border-white/10 rounded-xl p-6` (member-facing, spacious) or `p-4` (manager-facing, dense — see §6)
- Card title: `text-base font-semibold text-zinc-100`, optionally with a `text-zinc-400 text-sm` subtitle line beneath

### Status Badges

`rounded-full px-2.5 py-1 text-xs font-medium border` using the §2 status table. Example (`SUBMITTED`): `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1 text-xs font-medium`.

### Data Tables (Manager Dashboard)

- Header row: `bg-white/5 text-zinc-400 text-xs uppercase tracking-wider font-medium border-b border-white/10`
- Rows: `border-b border-white/5 hover:bg-white/5 text-zinc-200 text-sm transition-colors`
- No zebra striping — hover is the only row-differentiation device, consistent with §1's "borders, not decoration" stance.
- Dense padding: `py-2.5 px-4` per cell (see §6 for why manager views run tighter than member views).
- Wrap in `overflow-x-auto` for mobile.

### Charts (Recharts)

- Grid lines: `stroke="#27272a"` (`zinc-800`)
- Axis text: `fill="#a1a1aa"` (`zinc-400`)
- Tooltip: `bg-zinc-900 border border-white/10 rounded-lg` container, `text-zinc-100 text-sm` content
- Primary series color: violet (`#7c3aed` / `#8b5cf6`)
- Status-breakdown series: reuse the §2 status colors (emerald/red/amber) so a chart and a badge for the same status always match
- Always wrap in Recharts' `ResponsiveContainer`

### Navigation (Sidebar)

- Container: `bg-zinc-950 border-r border-white/10`
- Active link: `bg-violet-500/10 text-violet-400 border-l-2 border-violet-500 font-medium`
- Inactive link: `text-zinc-400 hover:text-zinc-100 hover:bg-white/5`
- Collapses to a hamburger/drawer on `md` and below.

---

## 6. Role-Based Layout Differentiation

The two roles get **deliberately different densities** — this isn't inconsistency, it's designing for what each role is actually doing.

### Team Member — Focus & Simplicity

The personal report form is filled out once a week, by hand, with real thought going into the text fields. It should feel calm, not like a data-entry grid.

- Centered single column, `max-w-2xl mx-auto`, generous vertical rhythm (`space-y-6` between fields, `py-12` page padding)
- Larger touch/click targets: `text-base` inputs, not `text-sm`
- Textareas (`tasksCompleted`, `tasksPlanned`, `blockers`) get real height (`min-h-32`) and room to breathe — this is where the actual content of the report lives
- Report history below the form: a simple stacked list of cards, most-recent-first, not a table

### Manager — Density & Control

The dashboard's job is surfacing patterns across the whole team at a glance. Whitespace that would feel calm on the member page just wastes scroll space here.

- Sidebar + full-width content area, not centered
- Metric cards use the hero-number treatment (§3) — this is the one place `text-4xl`+ appears outside a headline
- Tables run `text-xs`/`text-sm` with tight `py-2.5` row padding (vs. the member view's spacious feel)
- The compliance-rate metric is the single most emphasized number on the page — largest size, `text-violet-400`, first position in the metric-card grid. Everything else in the summary row is secondary to it.
- Charts sit two-to-three across on desktop, stacking on mobile

---

## 7. Page-Level Layout Specifications

### Login / Register

- Centered card (`max-w-md`) on the plain `bg-zinc-950` canvas — no secondary background color needed, the glass card itself provides the contrast
- Single column, `space-y-5` between fields
- App name/logo above the form, `text-zinc-100`

### Team Member — Personal Report Page

- Top navbar (`bg-zinc-950 border-b border-white/10`), full width
- Below it: the centered form per §6
- Report history renders beneath, organized by week, most recent first

### Manager — Team Dashboard Page

- Sidebar (§5) + main content area
- **Top:** metric cards, `grid-cols-1 md:grid-cols-3`, compliance rate emphasized per §6
- **Middle:** 2-3 Recharts charts, `grid-cols-1 lg:grid-cols-2` or `lg:grid-cols-3`
- **Bottom:** filterable data table of all team reports (§5's dense table spec)
- **Floating chat widget** (bonus, if implemented): bottom-right, `bg-zinc-900 border border-white/10 rounded-xl`, toggleable

---

## 8. Responsiveness

- Mobile-first: build the small-screen layout first, expand with `sm:`/`md:`/`lg:`.
- Manager sidebar collapses to a hamburger drawer at `md` and below.
- Charts wrapped in `ResponsiveContainer`; tables wrapped in `overflow-x-auto`.
- Member-page spacing (`py-12`, `max-w-2xl`) can compress slightly on mobile (`py-6`) but keeps its single-column, spacious character — density is a manager-view thing, not a mobile-view thing.

---

## 9. Accessibility — Verified, Not Assumed

Every color pair in §2 was checked against the actual WCAG 2.1 contrast formula (relative luminance, not a visual guess) before being written into this doc. The numbers that matter:

| Pair                                                  | Ratio              | AA body (4.5:1) | AA large/UI (3:1) |
| ----------------------------------------------------- | ------------------ | --------------- | ----------------- |
| `zinc-100` on `zinc-950`                              | 18.1:1             | Pass            | Pass              |
| `zinc-300` on `zinc-950`                              | 13.5:1             | Pass            | Pass              |
| `zinc-400` on `zinc-950`                              | 7.8:1              | Pass            | Pass              |
| `zinc-400` on `zinc-900`                              | 6.9:1              | Pass            | Pass              |
| `zinc-500` on `zinc-950`                              | 4.1:1              | **Fail**        | Pass              |
| `zinc-600` on `zinc-950`                              | 2.6:1              | **Fail**        | **Fail**          |
| `violet-400` on `zinc-950`/`zinc-900`                 | 7.3:1 / 6.5:1      | Pass            | Pass              |
| White on `violet-600` (button default)                | 5.7:1              | Pass            | Pass              |
| White on `violet-500` (naive "lighten on hover")      | 4.2:1              | **Fail**        | Pass              |
| White on `violet-700` (actual hover, darkened)        | 7.1:1              | Pass            | Pass              |
| `emerald-400` / `red-400` / `amber-400` on `zinc-900` | 9.2 / 6.4 / 10.6:1 | Pass            | Pass              |

**Binding rules that follow directly from this table:**

1. Never use `zinc-500` for body text, labels, or captions — placeholder text only. Never use `zinc-600` or darker for any text a user is meant to read.
2. Button hover states **darken** (`violet-600` → `violet-700`), never lighten. `violet-500` is reserved for text/accent use on dark backgrounds, not as a button fill.
3. Focus rings always specify `ring-offset-zinc-950` (or `zinc-900` inside a solid card) — never rely on the browser's default white offset.
4. All interactive elements are keyboard-navigable; semantic HTML (`<button>`, `<nav>`, `<main>`, `<form>`, `<table>`) throughout; every icon-only control gets an `aria-label`.
5. If a new color pairing is introduced later that isn't in the table above, verify it the same way (relative-luminance contrast ratio) before shipping it — don't eyeball dark-mode contrast, it's notoriously easy to get wrong by feel.
