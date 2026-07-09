# UI/UX Design Guidelines

The frontend delivers a **restrained neo-brutalism, in both light and dark**: a dark charcoal zinc canvas in dark mode (not near-black — see the Provenance note below) or a light zinc-100 canvas in light mode, solid surfaces framed by a single consistent high-contrast border, hard offset "brutal" shadows instead of blurred `shadow-lg`s, sharp (unrounded) corners, and one saturated violet accent used deliberately. It is brutalist in its bones (visible structure, physical-feeling interactions) and minimalist in its execution (one border color per theme, one accent, generous whitespace, no color-blocking, no clutter). These guidelines are non-negotiable. All agents building UI components must adhere to them strictly.

**Scope decision (revised):** this system originally shipped dark-mode only, with the explicit note that a light mode would be "a new design pass, not a toggle" if ever requested. It was requested — see §10 for the light-mode palette, the verified contrast numbers, and the toggle mechanism (`hooks/useTheme.tsx`, a `.dark` class on `<html>`). **Every themed class in every component is now a `<light-class> dark:<dark-class>` pair** — there is no more "the dark value is just the value," both themes are first-class and both must be specified whenever a new themed class is added.

**Provenance:** this replaces the earlier "glass" system (translucent `bg-white/5`/`border-white/10` surfaces, soft `rounded-xl` corners, no shadows). That system is gone — do not resurrect glass/translucent surface patterns anywhere in new work.

**Provenance (dark palette softened):** the dark scale was originally `zinc-950`/`900`/`800` (canvas/surface/raised) — near-black, at the request of a reviewer who found it too harsh. Shifted one step lighter across the board (`zinc-900`/`800`/`700`) after re-verifying every affected contrast pair, not just eyeballing it "looks softer." One real regression turned up from the shift and was fixed: the `DRAFT` badge's muted border (`zinc-500`) cleared 3:1 against the _old_ darkest raised tone but drops to 2.16:1 against the new one — dark mode's muted-border floor is now `zinc-400` (light mode's stays `zinc-500`, unaffected by this change). See §2/§9/§10 for the current numbers.

**Provenance (dark structural border/shadow softened):** the dark-mode structural border and matching `shadow-brutal-dark*` offset were originally `zinc-100` (`#f4f4f5`, near-white) — visually correct for maximum brutalist contrast, but reported as uncomfortable to look at for extended periods: a near-white hairline against a dark canvas is a high-contrast edge the eye keeps re-focusing on. Moved to `zinc-300` (`#d4d4d8`) for every dark-mode structural border, the matching shadow offset, and the two dashboard charts' tooltip border — still reads clearly as "the" border color (12.0:1 / 10.1:1 / 7.1:1 against the canvas/surface/raised tiers, all far above the 3:1 floor) without the glare. Dark mode's `text-zinc-100` (primary heading/body text) is unaffected — this change is scoped to lines (borders and shadows), not text, which has a real 4.5:1 legibility requirement `zinc-100` is there to satisfy.

---

## 1. Theme & Aesthetic Philosophy

- **Monochromatic base, one accent.** The zinc scale carries almost the entire UI. Violet is spent deliberately — primary actions, active states, key metrics, focus states — never decoratively. If everything is accented, nothing is.
- **Depth from borders and hard shadows, not blur.** Every structural surface (cards, buttons, inputs) gets the same border color per theme (`border-zinc-900` light / `border-zinc-300` dark — **not** pure white/`zinc-100` in dark mode, which reads as glaring/uncomfortable against the dark canvas; see the Provenance note) at `border-2` — one consistent line weight and color, applied everywhere, is what makes the system read as _designed_ rather than _decorated_. Elevation comes from an offset, blur-less `shadow-brutal*` (a solid rectangle offset 2-6px, not a soft `shadow-lg`).
- **Interactions feel physical.** Primary/secondary/danger buttons "press" on hover: the hard shadow disappears and the element slides into the space the shadow occupied (`hover:translate-x-1 hover:translate-y-1 hover:shadow-none`). This is the signature neo-brutalist affordance — it reads as a physical button being pushed in, not just a color change.
- **Sharp corners.** `rounded-none` on every structural primitive (cards, buttons, inputs, badges, table cells). This is a deliberate, universal rule, not a per-component choice — a stray `rounded-lg` anywhere breaks the system's coherence immediately.
- **Density is a deliberate, role-specific choice**, not an accident of not-caring. The Team Member surface is spacious and focused; the Manager surface is dense and information-rich. Neither is "the default" — each is tuned to what that role is doing. See §6. (This is unchanged from the previous system — brutalism is a surface treatment, not a layout philosophy, and the role-density decision still stands.)
- **Consistency.** The same component used in two places looks and behaves identically. Use the shared `components/ui/` primitives — never one-off styled elements.
- **Accessibility is load-bearing, not a checklist item.** Every color/border pair below was run through the actual WCAG 2.1 relative-luminance formula, not eyeballed — including the **non-text 3:1 contrast requirement for borders** (WCAG 1.4.11), which the previous glass system never had to worry about since translucent borders aren't solid color pairs. See §9 for the verified numbers and the rules they produce.

---

## 2. Color System

All colors are Tailwind's stock `zinc` and `violet`/`emerald`/`red`/`amber` scales — no custom hex values. Reference them by Tailwind class, not hex, in components. The only non-stock additions are the `shadow-brutal*` tokens in `tailwind.config.ts` (Tailwind has no built-in for a blur-less offset shadow).

### Base (zinc) — dark mode values (see §10 for the light-mode pairing of every row)

| Token                | Dark class (`dark:`) | Hex       | Usage                                                                                                                                                                     |
| -------------------- | -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas               | `bg-zinc-900`        | `#18181b` | Page background, the base layer everything sits on                                                                                                                        |
| Surface              | `bg-zinc-800`        | `#27272a` | Solid card/widget/input fill — **always solid, never translucent**                                                                                                        |
| Raised surface       | `bg-zinc-700`        | `#3f3f46` | Table headers, hover state on rows sitting inside a `zinc-800` card                                                                                                       |
| Recessed surface     | `bg-zinc-900`        | `#18181b` | Form inputs (recessed _into_ the canvas, distinct from raised cards)                                                                                                      |
| Structural border    | `border-zinc-300`    | `#d4d4d8` | **The one border color used everywhere** — cards, buttons, inputs, badges' neutral state. Deliberately not `zinc-100`/near-white — see the Provenance note                |
| Muted border         | `border-zinc-400`    | `#a1a1aa` | Only where a border must be visually de-emphasized (e.g. `DRAFT` badge) but still needs to clear the 3:1 non-text minimum against every surface it can appear on — see §9 |
| Divider (decorative) | `border-zinc-700`    | `#3f3f46` | Plain row/list dividers that aren't a "component boundary" (not subject to the 3:1 rule)                                                                                  |

### Text — dark mode values

| Token            | Tailwind class  | Hex       | Usage                                                    | Contrast on `zinc-900` canvas |
| ---------------- | --------------- | --------- | -------------------------------------------------------- | ----------------------------- |
| Primary          | `text-zinc-100` | `#f4f4f5` | Headings, primary content                                | 16.1:1                        |
| Body             | `text-zinc-300` | `#d4d4d8` | Regular body copy, form values                           | 12.0:1                        |
| Secondary        | `text-zinc-400` | `#a1a1aa` | Captions, table headers, helper text, labels             | 6.9:1                         |
| Placeholder only | `text-zinc-500` | `#71717a` | Input placeholders **only** — see §9, fails body-text AA | 3.7:1                         |

`zinc-500` and anything darker (`zinc-600`+) must never be used for real text (labels, captions, disabled-but-legible content) — see §9's verified failure. `zinc-500` is placeholder-only for text. For **borders** the floor is theme-specific: `zinc-500` in light mode, `zinc-400` in dark mode (see the Base table above and the Provenance note) — this is the one place dark and light diverge on which exact zinc shade is "the muted one," because the darker dark-mode surfaces sit closer to `zinc-500` on the luminance scale than light mode's white/near-white surfaces do.

### Accent — Violet

| Token        | Tailwind class    | Hex       | Usage                                                                               |
| ------------ | ----------------- | --------- | ----------------------------------------------------------------------------------- |
| Primary fill | `bg-violet-600`   | `#7c3aed` | Primary button fill, active nav background                                          |
| Focus/ring   | `ring-violet-500` | `#8b5cf6` | Focus-visible ring on every interactive element (unchanged behavior)                |
| Accent text  | `text-violet-400` | `#a78bfa` | Links, hero-metric emphasis on dark backgrounds                                     |
| Accent hover | `text-violet-300` | `#c4b5fd` | Text-link hover (brightens — safe for text-on-dark, unlike a filled button; see §9) |

### Status (Report Lifecycle)

Badges are outlined blocks, not translucent pills: `border-2` + matching text color, transparent background (so the badge reads correctly on any surface tier in either theme without a mismatched fill). `DRAFT` is the odd one out — it's inactive, not "colored," so it uses the muted border floor (§ above) instead of a status color. This table shows dark-mode values; see §10 for the full light-mode pairing of every status.

| Status      | Text (dark)        | Border (dark)        |
| ----------- | ------------------ | -------------------- |
| `SUBMITTED` | `text-emerald-400` | `border-emerald-500` |
| `LATE`      | `text-red-400`     | `border-red-500`     |
| `PENDING`   | `text-amber-400`   | `border-amber-500`   |
| `DRAFT`     | `text-zinc-400`    | `border-zinc-400`    |

All four verified well above the relevant thresholds against the current dark canvas/surface tiers — see §9.

---

## 3. Typography

- **Font:** `Inter`, loaded via `next/font/google` (not a `<link>` tag — avoids a render-blocking request and gets automatic font-display optimization). `Geist` is an acceptable drop-in swap if preferred later; the type scale below doesn't change either way.
- **Numerals:** apply `tabular-nums` (`font-variant-numeric: tabular-nums`, or Tailwind's `tabular-nums` class) to anything with stacked/aligned numbers — dashboard metric cards, table columns of hours/counts, dates. Without it, proportional digit widths make columns visibly wobble.
- **Labels and section headers lean uppercase.** `text-xs font-bold uppercase tracking-wider` for table headers, card eyebrow labels, and badges — this is a brutalist typographic signature (bold, structural, slightly loud) and was already the established pattern for table headers; it now extends to badges too (see §5).

| Role                         | Class                                                        | Notes                                                                             |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Hero metric (dashboard stat) | `text-4xl md:text-5xl font-bold tracking-tight tabular-nums` | The "premium condensed" number treatment — compliance rate, total submitted, etc. |
| Page title (h1)              | `text-2xl md:text-3xl font-bold tracking-tight`              | Bold, not semibold — brutalist headings carry more weight                         |
| Section heading (h2)         | `text-lg md:text-xl font-bold`                               |                                                                                   |
| Card title (h3)              | `text-base font-bold`                                        |                                                                                   |
| Body                         | `text-sm text-zinc-300`                                      | Default for form values, paragraph content                                        |
| Table / dense data           | `text-xs md:text-sm`                                         | Manager view — see §6                                                             |
| Label                        | `text-sm font-medium text-zinc-300`                          | Form field labels                                                                 |
| Caption / helper             | `text-xs text-zinc-400`                                      | Never `zinc-500` — see §9                                                         |
| Eyebrow / table header       | `text-xs font-bold uppercase tracking-wider text-zinc-400`   | See above                                                                         |

---

## 4. Spacing, Depth & Elevation

No blurred `shadow-lg`/`shadow-md` utilities anywhere. Elevation is a **hard, offset, blur-less shadow** — defined once in `tailwind.config.ts` as `shadow-brutal*` tokens — paired with the universal `border-2 border-zinc-300`:

- **Default card:** `bg-zinc-800 border-2 border-zinc-300 shadow-brutal rounded-none` (dark mode — pair with the light-mode equivalent per §10)
- **Hero/emphasis card:** `shadow-brutal-lg` instead of `shadow-brutal` (bigger offset, more presence)
- **Primary/focus emphasis:** `shadow-brutal-violet` (same offset, violet instead of zinc-100) — used on the primary button and on focused inputs
- **Danger emphasis:** `shadow-brutal-red` — the danger button only
- **The press interaction:** on hover, shadowed elements lose their shadow and translate by the shadow's own offset — `hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`. This simulates the element being physically pushed down into the page.
- **Dividers:** `border-zinc-700` (dark) / `border-zinc-300` (light) for plain list/row dividers (not subject to the 3:1 rule — decorative rhythm, not a component boundary)
- **Focus ring:** `ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900` (dark) / `ring-offset-zinc-100` (light) — the offset color **must** match the actual background (or `zinc-800`/white inside a solid card); a mismatched offset ring looks like a bug. This is independent of the brutal-shadow system and still applies to every interactive element, including in the pressed/hover state.

### Radius

**`rounded-none` on every structural primitive — cards, buttons, inputs, dropdowns, badges, table cells.** This is the one universal rule with no per-component exceptions. Sharp corners are as much a part of the brutalist signature as the border/shadow language; a stray rounded corner reads as a bug, not a variation.

---

## 5. Component Specifications

### Buttons

- **Primary:** `border-2 border-zinc-300 bg-violet-600 text-white font-medium rounded-none px-4 py-2 shadow-brutal-violet hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`
- **Secondary:** `border-2 border-zinc-300 bg-zinc-800 text-zinc-100 font-medium rounded-none px-4 py-2 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all` (dark mode values shown; pair with light per §10)
- **Ghost:** `border-2 border-transparent text-zinc-400 font-medium rounded-none px-4 py-2 hover:border-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors` — flat by default (no shadow), only gains a border on hover; this is what visually distinguishes it from primary/secondary's constant "raised" look, not a color difference
- **Danger:** `border-2 border-zinc-300 bg-red-600 text-white font-medium rounded-none px-4 py-2 shadow-brutal-red hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all` (destructive actions only — deleting a project, etc.)
- All buttons: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none` — a disabled button keeps its resting shadow (it can't be "pressed"), which correctly reads as unavailable
- Focus: `focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900` — independent of and stacked with the hover-press state

### Form Inputs

- `bg-zinc-900 border-2 border-zinc-300 rounded-none px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500` (dark mode; recessed surface, same tone as canvas)
- Focus: `focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none` — the border swaps color _and_ a small hard shadow appears, a clear "now editing" state change
- Error: `border-red-500 focus:shadow-brutal-red-sm` with helper text `text-red-400 text-xs mt-1.5` (dark) / `text-red-600` (light)
- Every input has a visible `<label className="text-sm font-medium text-zinc-300">` — never placeholder-as-label.

### Cards

- `bg-zinc-800 border-2 border-zinc-300 shadow-brutal rounded-none p-6` (dark mode; member-facing, spacious) or `p-4` (manager-facing, dense — see §6)
- Hero/emphasis variant: `shadow-brutal-lg` in place of `shadow-brutal`
- Card title: `text-base font-bold text-zinc-100`, optionally with a `text-zinc-400 text-sm` subtitle line beneath

### Status Badges

`border-2 rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-transparent` using the §2 status table. Example (`SUBMITTED`): `border-2 border-emerald-500 text-emerald-400 bg-transparent rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider`.

### Data Tables (Manager Dashboard)

- Header row: `bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider border-b-2 border-zinc-300` (dark; the "raised" tier)
- Rows: `border-b border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors` (dark)
- No zebra striping — hover is the only row-differentiation device.
- Dense padding: `py-2.5 px-4` per cell (see §6 for why manager views run tighter than member views).
- Wrap in `overflow-x-auto` for mobile.
- Any per-row icon-only interactive control (expand/collapse, unassign) must be a real `<button>` with an `aria-label` naming the row's subject — never a bare `<tr onClick>` with no keyboard path.

### Charts (Recharts)

- Grid lines: `stroke="#3f3f46"` dark / `#d4d4d8` light (the divider/raised tone in each theme)
- Axis text: `fill="#a1a1aa"` dark / `#52525b` light (the secondary-text tone in each theme)
- Tooltip: `bg-zinc-800` dark / `bg-white` light, `2px solid` border in the theme's structural-border color (matches the universal structural border, not a translucent hairline), no border-radius
- Primary series color: violet (`#7c3aed` / `#8b5cf6`)
- Status-breakdown series: reuse the §2 status colors (emerald/red/amber) so a chart and a badge for the same status always match
- Always wrap in Recharts' `ResponsiveContainer`
- Wrap the chart container in `role="img"` with a text `aria-label` summarizing the data — Recharts' SVG output exposes no text content to screen readers otherwise

### Navigation (Sidebar / Navbar)

- Container: `bg-zinc-900 border-r-2 border-zinc-300` (sidebar, dark) / `border-b-2 border-zinc-300` (top navbar) — canvas tone, pair with light per §10
- Active link: `bg-violet-600 text-white border-2 border-zinc-300 rounded-none font-medium` — solid fill, not a translucent tint
- Inactive link: `text-zinc-400 border-2 border-transparent hover:border-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 rounded-none` (dark)
- Sidebar collapses to a hamburger/drawer on `md` and below; the top navbar (member view) stays single-row at every width — see §8 for the specific mobile treatment.

### Inline Links (prose)

- `text-violet-400 underline decoration-2 underline-offset-2 font-semibold hover:text-violet-300` — **underline is always on**, not hover-only. This is both a brutalist typographic choice (a link is visibly a link, not a color-only affordance) and a genuine accessibility improvement (WCAG 1.4.1 discourages color as the _only_ means of conveying a link within body text).
- Nav links and buttons are a different category — they get the border/background treatment above, not underlines.

---

## 6. Role-Based Layout Differentiation

The two roles get **deliberately different densities** — this isn't inconsistency, it's designing for what each role is actually doing. This section is unchanged by the visual-system rewrite: brutalism is a surface treatment (borders, shadows, corners, color), not a layout philosophy.

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
- The compliance-rate metric is the single most emphasized number on the page — largest size, `text-violet-400`, `shadow-brutal-lg` card, first position in the metric-card grid. Everything else in the summary row is secondary to it.
- Charts sit two-to-three across on desktop, stacking on mobile

---

## 7. Page-Level Layout Specifications

### Login / Register

- Centered card (`max-w-sm`) on the plain canvas (`bg-zinc-900` dark / `bg-zinc-100` light) — the card's own border + hard shadow provide all the contrast needed, no secondary background color
- Single column, `space-y-5` between fields
- App name/logo above the form, `text-zinc-100`

### Team Member — Personal Report Page

- Top navbar (canvas tone + `border-b-2 border-zinc-300`), full width, single row at every viewport (see §8)
- Below it: the centered form per §6
- Report history renders beneath, organized by week, most recent first

### Manager — Team Dashboard Page

- Sidebar (§5) + main content area
- **Top:** metric cards, `grid-cols-1 md:grid-cols-3`, compliance rate emphasized per §6
- **Middle:** 2-3 Recharts charts, `grid-cols-1 lg:grid-cols-2` or `lg:grid-cols-3`
- **Bottom:** filterable data table of all team reports (§5's dense table spec)
- **Floating chat widget** (bonus, if implemented): bottom-right, surface tone (`bg-zinc-800` dark / `bg-white` light) `border-2 border-zinc-300 shadow-brutal rounded-none`, toggleable

---

## 8. Responsiveness

- Mobile-first: build the small-screen layout first, expand with `sm:`/`md:`/`lg:`.
- Manager sidebar collapses to a hamburger drawer at `md` and below.
- The member top navbar must **never wrap onto multiple lines**, at any supported width — verify this explicitly (a `boundingBox()`/screenshot check, not an assumption) any time a nav item is added. The established pattern for staying on one row at narrow widths: abbreviate the wordmark (`hidden sm:inline` full text / `sm:hidden` short form), tighten gaps and button padding below `sm:`, and keep `whitespace-nowrap` on every nav element.
- Charts wrapped in `ResponsiveContainer`; tables wrapped in `overflow-x-auto` (the table scrolls internally — the page itself must never gain horizontal scroll).
- Member-page spacing (`py-12`, `max-w-2xl`) can compress slightly on mobile (`py-6`) but keeps its single-column, spacious character — density is a manager-view thing, not a mobile-view thing.

---

## 9. Accessibility — Verified, Not Assumed

Every color/border pair in §2 was checked against the actual WCAG 2.1 contrast formula (relative luminance, not a visual guess) before being written into this doc — including, for this system, the **1.4.11 non-text 3:1 minimum for borders**, which matters far more here than in the old glass system since every structural border is now a solid color instead of a translucent one.

Numbers below are for the current (softened) dark palette — `zinc-900` canvas / `zinc-800` surface / `zinc-700` raised. When the palette shifts, every row here needs re-verifying, not just re-typing with new hex codes (see the Provenance note in §1 — that's exactly the mistake this table exists to prevent).

| Pair                                                                                 | Ratio               | AA body (4.5:1) | AA large/UI (3:1)                                                                   |
| ------------------------------------------------------------------------------------ | ------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `zinc-100` text on `zinc-900` canvas                                                 | 16.1:1              | Pass            | Pass                                                                                |
| `zinc-300` text on `zinc-800` surface                                                | 10.1:1              | Pass            | Pass                                                                                |
| `zinc-400` text on `zinc-900` canvas                                                 | 6.9:1               | Pass            | Pass                                                                                |
| `zinc-500` text on `zinc-900` canvas (placeholder only)                              | 3.7:1               | **Fail**        | Pass                                                                                |
| `violet-400` text on `zinc-900` canvas                                               | ~7:1                | Pass            | Pass                                                                                |
| `violet-300`/`violet-400` text on `zinc-800` surface                                 | ~8-9:1 / ~6:1       | Pass            | Pass                                                                                |
| White text on `violet-600` (primary button fill)                                     | 5.7:1               | Pass            | Pass                                                                                |
| White text on `red-600` (danger button fill)                                         | 4.8:1               | Pass            | Pass                                                                                |
| **`zinc-300` border on `zinc-900`/`zinc-800`/`zinc-700`** (structural border)        | 12.0 / 10.1 / 7.1:1 | —               | Pass on every surface tier                                                          |
| **`zinc-700` border on `zinc-900`**                                                  | 1.9:1               | —               | **Fail** — do not use as a border                                                   |
| **`zinc-600` border on `zinc-900`**                                                  | ~2.5:1              | —               | **Fail** — do not use as a border                                                   |
| **`zinc-500` border on `zinc-900` canvas**                                           | 3.7:1               | —               | Pass                                                                                |
| **`zinc-500` border on `zinc-700` raised** (e.g. a `DRAFT` badge in a hovered row)   | 2.16:1              | —               | **Fail** — this is why dark mode's muted-border floor is `zinc-400`, not `zinc-500` |
| **`zinc-400` border on `zinc-900`/`zinc-800`/`zinc-700`** (muted border floor, dark) | 6.9 / 5.8 / 4.1:1   | —               | Pass on every surface tier                                                          |
| `emerald-500` / `red-500` / `amber-500` border on `zinc-900` (badges)                | ~7 / ~4.7 / ~8.3:1  | —               | Pass                                                                                |
| `violet-500` focus ring on `zinc-900`                                                | ~4.2:1              | —               | Pass                                                                                |

**Binding rules that follow directly from this table:**

1. Never use `zinc-500` for body text, labels, or captions — placeholder text only.
2. **Never use `zinc-600` or `zinc-700` as a border color** — both fail the 3:1 non-text contrast minimum against `zinc-900`. If a border needs to be visually muted (not the default structural `zinc-100`), the dark-mode floor is `zinc-400` — **not `zinc-500`**, which looks safe against the canvas alone but fails against the lighter raised tier a badge can also appear on (see the `DRAFT`-badge-in-a-hovered-row row above). Always check a muted border against the _lightest_ surface it could realistically sit behind, not just the canvas.
3. The structural border is always `zinc-100` — this isn't just an aesthetic default, it's the only zinc tone in the muted range that's unambiguously safe at every weight, so standardizing on it avoids re-deriving this contrast math per component.
4. Button hover/press states swap shadow + position (§4), never rely on a color-only change that could fail contrast — this sidesteps the darken-vs-lighten contrast question the previous system had to solve for button fills entirely.
5. Focus rings always specify `ring-offset-zinc-900` (or `zinc-800` inside a solid card) — never rely on the browser's default white offset.
6. All interactive elements are keyboard-navigable; semantic HTML (`<button>`, `<nav>`, `<main>`, `<form>`, `<table>`) throughout; every icon-only control gets an `aria-label`; multiple instances of the same control on one page (e.g. a table's per-row "Edit" button) get a **row-specific** `aria-label`, not a generic one.
7. Inline prose links carry an always-on underline (§5) — don't rely on color alone to signal "this is a link."
8. If a new color or border pairing is introduced later that isn't in the table above, verify it the same way (relative-luminance contrast ratio, remembering borders need the 3:1 non-text threshold, not 4.5:1, **and need checking against every surface tier they can appear on, not just one**) before shipping it — don't eyeball dark-mode contrast, it's notoriously easy to get wrong by feel.

---

## 10. Light Mode & Theme Toggle

Added after the system initially shipped dark-only (§ intro). Same neo-brutalist bones — solid surfaces, one structural border, hard offset shadows, sharp corners — just with the tonal relationship inverted: **light canvas is darker than light surface** (mirrors dark mode, where canvas `zinc-900` is darker than surface `zinc-800` — the surface is always "the brightest/cleanest" element in either theme).

### Mechanism

- Tailwind's `class` dark-mode strategy (`darkMode: 'class'` in `tailwind.config.ts`). A `.dark` class on `<html>` switches every `dark:`-prefixed utility on.
- `hooks/useTheme.tsx` — a small context provider (`ThemeProvider` + `useTheme()`), **not** a TanStack Query hook, since this is client-only UI state, not server state. Persists to `localStorage` (`theme` key), defaults to the OS `prefers-color-scheme` if nothing is stored, and falls back to dark if neither is available (matches the app's original design intent).
- An inline, render-blocking `<script>` in `app/layout.tsx` (before `<Providers>`) sets the `.dark` class synchronously, before hydration — this is what prevents a flash of the wrong theme on load. `ThemeProvider`'s own effects just keep React's state in sync with what the script already set.
- `components/ui/ThemeToggle.tsx` — a sun/moon icon button (`lucide-react`), placed in the member `Navbar`, the manager `Sidebar` (both the account-footer area and the mobile top bar), and the landing page header.

### The one hard rule

**Every themed class is a pair: `<light> dark:<dark>`.** There is no implicit default — a class written without its `dark:` counterpart (or vice versa) is a bug, not a simplification, because it means that value doesn't change between themes when everything around it does. When adding a new component, write both halves of every color/border/shadow class at the same time; don't ship "dark works, I'll add light later."

### Color System — Light-Mode Equivalents

Same roles as §2, same relationship rules, tonal direction inverted:

| Role                              | Dark (`dark:`)                                         | Light (default)                        | Notes                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas                            | `bg-zinc-900`                                          | `bg-zinc-100`                          | Page background. Softened one step from the original `zinc-950` — see the Provenance note in §1                                                                                                                                    |
| Surface (cards)                   | `bg-zinc-800`                                          | `bg-white`                             | Always the brightest/cleanest element in either theme                                                                                                                                                                              |
| Raised (table header, hover tint) | `bg-zinc-700` / `bg-zinc-800`*                         | `bg-zinc-200`                          | *Ghost-button/nav-link hover in dark mode reuses the surface tone (`zinc-800`) rather than the true raised tone (`zinc-700`) — a pre-existing minor inconsistency carried forward unchanged, not introduced by the light-mode work |
| Recessed (inputs)                 | `bg-zinc-900`                                          | `bg-zinc-100`                          | Same tone as canvas in both themes                                                                                                                                                                                                 |
| Structural border                 | `border-zinc-300`                                      | `border-zinc-900`                      | The one universal border color, per theme. Dark mode is deliberately not `zinc-100`/near-white — see Provenance                                                                                                                    |
| Muted border                      | `border-zinc-400`                                      | `border-zinc-500`                      | **Not the same value in both themes** (see §9) — `zinc-400` in dark (6.9:1 on canvas, 4.1:1 on the lightest raised surface, clears 3:1 everywhere); `zinc-500` in light (4.83:1 on white)                                          |
| Divider (decorative)              | `border-zinc-700`                                      | `border-zinc-300`                      | Not subject to the 3:1 rule (decorative, not a component boundary)                                                                                                                                                                 |
| Text primary                      | `text-zinc-100`                                        | `text-zinc-900`                        |                                                                                                                                                                                                                                    |
| Text body                         | `text-zinc-300`                                        | `text-zinc-700`                        |                                                                                                                                                                                                                                    |
| Text secondary                    | `text-zinc-400`                                        | `text-zinc-600`                        | Labels, captions, table headers                                                                                                                                                                                                    |
| Placeholder only                  | `text-zinc-500`                                        | `text-zinc-400`                        | Fails body-text AA in both themes — placeholder use only                                                                                                                                                                           |
| Shadow (neutral)                  | `shadow-brutal-dark` etc. (zinc-100 offset)            | `shadow-brutal` etc. (zinc-900 offset) | See `tailwind.config.ts` — `brutal`/`brutal-lg`/`brutal-sm` are light-default, `-dark` suffixed variants apply under `dark:`. Shadow color is independent of canvas darkness, so the softening pass didn't touch these             |
| Shadow (violet/red)               | `shadow-brutal-violet` / `shadow-brutal-red` (+ `-sm`) | _same_                                 | Theme-invariant — same accent hex in both themes, no `dark:` pair needed                                                                                                                                                           |
| Accent text (links)               | `text-violet-400`                                      | `text-violet-600`                      |                                                                                                                                                                                                                                    |
| Accent hover                      | `text-violet-300` (brightens)                          | `text-violet-700` (darkens)            | Both directions _increase_ contrast against their respective background — the principle is "hover moves toward the background's high-contrast extreme," not "always lighten" or "always darken"                                    |
| Badge `SUBMITTED`                 | `emerald-500` / `emerald-400`                          | `emerald-700`                          | `emerald-500`/`-400` don't clear 4.5:1 AA on white; `-700` does (5.48:1)                                                                                                                                                           |
| Badge `LATE`                      | `red-500` / `red-400`                                  | `red-700`                              | Consistency with the other badges' one-shade-darker light treatment (plain `red-600` alone clears AA at 4.83:1, but `-700` keeps the "how much darker" rule uniform across all three statuses)                                     |
| Badge `PENDING`                   | `amber-500` / `amber-400`                              | `amber-700`                            | `amber-500`/`-600` don't clear 4.5:1 AA on white; `-700` does (5.02:1)                                                                                                                                                             |
| Badge `DRAFT`                     | `border-zinc-400` / `text-zinc-400`                    | `border-zinc-500` / `text-zinc-600`    | Border uses the theme-specific muted-border floor (see above, and §9 for why `zinc-500` isn't safe in dark mode); text uses the theme's secondary-text shade                                                                       |

### Charts (Recharts) — theme-aware hex

Recharts takes raw hex through props/inline styles, not Tailwind classes, so `dark:` variants don't apply. `TrendChart`/`WorkloadChart` call `useTheme()` and select from a small `{ light: {...}, dark: {...} }` hex map (grid stroke, axis stroke, tooltip background/border/label, line/bar color) instead. If a new chart is added, follow the same pattern — don't hardcode a single hex value that only looks right in one theme.

### Verified contrast — light-mode additions to §9's table

| Pair                                                           | Ratio                | AA body (4.5:1) | AA large/UI (3:1)                               |
| -------------------------------------------------------------- | -------------------- | --------------- | ----------------------------------------------- |
| `zinc-900` text on `zinc-100` canvas / white surface           | 16.1:1 / 17.7:1      | Pass            | Pass                                            |
| `zinc-700` text on white (body)                                | 10.4:1               | Pass            | Pass                                            |
| `zinc-600` text on white / `zinc-100` (secondary)              | 7.7:1 / 7.0:1        | Pass            | Pass                                            |
| `zinc-400` text on white (placeholder only)                    | 2.6:1                | **Fail**        | —                                               |
| `zinc-900` border on `zinc-100` / white (structural)           | 16.1:1 / 17.7:1      | —               | Pass                                            |
| `zinc-400` border on white                                     | 2.6:1                | —               | **Fail** — do not use as a light-mode border    |
| `zinc-500` border on white (muted border floor)                | 4.83:1               | —               | Pass                                            |
| `zinc-300` border on white (decorative divider)                | 1.48:1               | —               | N/A — decorative only, not a component boundary |
| `violet-600` / `violet-700` text on white (link / link hover)  | 5.7:1 / 7.1:1        | Pass            | Pass                                            |
| `emerald-700` / `red-700` / `amber-700` text on white (badges) | 5.48 / 6.47 / 5.02:1 | Pass            | Pass                                            |
| `violet-500` focus ring on white                               | 4.23:1               | —               | Pass                                            |

Same binding rule as §9: never eyeball a new light-mode pairing — run it through the actual formula, and remember `zinc-400`/`zinc-600`/`zinc-700` borders that look "fine" on white can still fail the 3:1 non-text minimum (as `zinc-400` did above) — light-mode contrast is just as easy to get wrong by feel as dark-mode's was.

### Landing Page

`app/page.tsx` — a marketing/landing page (not the previous minimal "sign in" screen), following this same system: header with the wordmark, `ThemeToggle`, and a sign-in link; a hero section with the primary/secondary CTA pair (create account / sign in) using the same button-press shadow interaction as the `Button` primitive (styled as a plain `<Link>`, per §5's "an `<a>` must never wrap a `<button>`" rule); a three-card feature grid using the `Card` primitive. It is reachable at all times regardless of auth state — it does not redirect a logged-in user away, matching the previous home page's behavior.
