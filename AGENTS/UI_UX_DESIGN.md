# UI/UX Design Guidelines

The frontend delivers a **restrained dark-mode neo-brutalism**: a near-black zinc canvas, solid zinc-900 surfaces framed by a single consistent high-contrast border, hard offset "brutal" shadows instead of blurred `shadow-lg`s, sharp (unrounded) corners, and one saturated violet accent used deliberately. It is brutalist in its bones (visible structure, physical-feeling interactions) and minimalist in its execution (one border color, one accent, generous whitespace, no color-blocking, no clutter). These guidelines are non-negotiable. All agents building UI components must adhere to them strictly.

**Scope decision:** this system is designed **dark-mode only**. Nothing in the brief calls for a light theme, and maintaining two parallel token sets (and re-verifying contrast for both) is scope not asked for. If a light mode is wanted later, flag it — it's a new design pass, not a toggle.

**Provenance:** this replaces the earlier "glass" system (translucent `bg-white/5`/`border-white/10` surfaces, soft `rounded-xl` corners, no shadows). That system is gone — do not resurrect glass/translucent surface patterns anywhere in new work.

---

## 1. Theme & Aesthetic Philosophy

- **Monochromatic base, one accent.** The zinc scale carries almost the entire UI. Violet is spent deliberately — primary actions, active states, key metrics, focus states — never decoratively. If everything is accented, nothing is.
- **Depth from borders and hard shadows, not blur.** Every structural surface (cards, buttons, inputs) gets the same `border-2 border-zinc-100` — one consistent line weight and color, applied everywhere, is what makes the system read as _designed_ rather than _decorated_. Elevation comes from an offset, blur-less `shadow-brutal*` (a solid rectangle offset 2-6px, not a soft `shadow-lg`).
- **Interactions feel physical.** Primary/secondary/danger buttons "press" on hover: the hard shadow disappears and the element slides into the space the shadow occupied (`hover:translate-x-1 hover:translate-y-1 hover:shadow-none`). This is the signature neo-brutalist affordance — it reads as a physical button being pushed in, not just a color change.
- **Sharp corners.** `rounded-none` on every structural primitive (cards, buttons, inputs, badges, table cells). This is a deliberate, universal rule, not a per-component choice — a stray `rounded-lg` anywhere breaks the system's coherence immediately.
- **Density is a deliberate, role-specific choice**, not an accident of not-caring. The Team Member surface is spacious and focused; the Manager surface is dense and information-rich. Neither is "the default" — each is tuned to what that role is doing. See §6. (This is unchanged from the previous system — brutalism is a surface treatment, not a layout philosophy, and the role-density decision still stands.)
- **Consistency.** The same component used in two places looks and behaves identically. Use the shared `components/ui/` primitives — never one-off styled elements.
- **Accessibility is load-bearing, not a checklist item.** Every color/border pair below was run through the actual WCAG 2.1 relative-luminance formula, not eyeballed — including the **non-text 3:1 contrast requirement for borders** (WCAG 1.4.11), which the previous glass system never had to worry about since translucent borders aren't solid color pairs. See §9 for the verified numbers and the rules they produce.

---

## 2. Color System

All colors are Tailwind's stock `zinc` and `violet`/`emerald`/`red`/`amber` scales — no custom hex values. Reference them by Tailwind class, not hex, in components. The only non-stock additions are the `shadow-brutal*` tokens in `tailwind.config.ts` (Tailwind has no built-in for a blur-less offset shadow).

### Base (zinc)

| Token                | Tailwind class    | Hex       | Usage                                                                                                                              |
| -------------------- | ----------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Canvas               | `bg-zinc-950`     | `#09090b` | Page background, the base layer everything sits on                                                                                 |
| Surface              | `bg-zinc-900`     | `#18181b` | Solid card/widget/input fill — **always solid, never translucent**                                                                 |
| Raised surface       | `bg-zinc-800`     | `#27272a` | Table headers, hover state on rows sitting inside a `zinc-900` card                                                                |
| Recessed surface     | `bg-zinc-950`     | `#09090b` | Form inputs (recessed _into_ the canvas, distinct from raised cards)                                                               |
| Structural border    | `border-zinc-100` | `#f4f4f5` | **The one border color used everywhere** — cards, buttons, inputs, badges' neutral state                                           |
| Muted border         | `border-zinc-500` | `#71717a` | Only where a border must be visually de-emphasized (e.g. `DRAFT` badge) but still needs to clear the 3:1 non-text minimum — see §9 |
| Divider (decorative) | `border-zinc-800` | `#27272a` | Plain row/list dividers that aren't a "component boundary" (not subject to the 3:1 rule)                                           |

### Text

| Token            | Tailwind class  | Hex       | Usage                                                    | Contrast on `zinc-950` |
| ---------------- | --------------- | --------- | -------------------------------------------------------- | ---------------------- |
| Primary          | `text-zinc-100` | `#f4f4f5` | Headings, primary content                                | 18.1:1                 |
| Body             | `text-zinc-300` | `#d4d4d8` | Regular body copy, form values                           | 13.5:1                 |
| Secondary        | `text-zinc-400` | `#a1a1aa` | Captions, table headers, helper text, labels             | 7.8:1                  |
| Placeholder only | `text-zinc-500` | `#71717a` | Input placeholders **only** — see §9, fails body-text AA | 4.1:1                  |

`zinc-500` and anything darker (`zinc-600`+) must never be used for real text (labels, captions, disabled-but-legible content) — see §9's verified failure. `zinc-500` is placeholder-only for text, and border-only-when-necessary for borders (it's the one place the two rules diverge, because WCAG's 3:1 non-text threshold is lower than 4.5:1 body-text).

### Accent — Violet

| Token        | Tailwind class    | Hex       | Usage                                                                               |
| ------------ | ----------------- | --------- | ----------------------------------------------------------------------------------- |
| Primary fill | `bg-violet-600`   | `#7c3aed` | Primary button fill, active nav background                                          |
| Focus/ring   | `ring-violet-500` | `#8b5cf6` | Focus-visible ring on every interactive element (unchanged behavior)                |
| Accent text  | `text-violet-400` | `#a78bfa` | Links, hero-metric emphasis on dark backgrounds                                     |
| Accent hover | `text-violet-300` | `#c4b5fd` | Text-link hover (brightens — safe for text-on-dark, unlike a filled button; see §9) |

### Status (Report Lifecycle)

Badges are outlined blocks, not translucent pills: `border-2` + matching text color, transparent background (so the badge reads correctly on both `zinc-950` and `zinc-900` parents without a mismatched fill). `DRAFT` is the odd one out — it's inactive, not "colored," so it uses the muted `zinc-500` border/text instead of a status color.

| Status      | Text               | Border               |
| ----------- | ------------------ | -------------------- |
| `SUBMITTED` | `text-emerald-400` | `border-emerald-500` |
| `LATE`      | `text-red-400`     | `border-red-500`     |
| `PENDING`   | `text-amber-400`   | `border-amber-500`   |
| `DRAFT`     | `text-zinc-400`    | `border-zinc-500`    |

All four verified well above the relevant thresholds against `zinc-950` — see §9.

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

No blurred `shadow-lg`/`shadow-md` utilities anywhere. Elevation is a **hard, offset, blur-less shadow** — defined once in `tailwind.config.ts` as `shadow-brutal*` tokens — paired with the universal `border-2 border-zinc-100`:

- **Default card:** `bg-zinc-900 border-2 border-zinc-100 shadow-brutal rounded-none`
- **Hero/emphasis card:** `shadow-brutal-lg` instead of `shadow-brutal` (bigger offset, more presence)
- **Primary/focus emphasis:** `shadow-brutal-violet` (same offset, violet instead of zinc-100) — used on the primary button and on focused inputs
- **Danger emphasis:** `shadow-brutal-red` — the danger button only
- **The press interaction:** on hover, shadowed elements lose their shadow and translate by the shadow's own offset — `hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`. This simulates the element being physically pushed down into the page.
- **Dividers:** `border-zinc-800` for plain list/row dividers (not subject to the 3:1 rule — decorative rhythm, not a component boundary)
- **Focus ring:** `ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-950` — the offset color **must** match the actual background (`zinc-950`, or `zinc-900` inside a solid card); a white/default offset ring looks like a bug on a dark canvas. This is independent of the brutal-shadow system and still applies to every interactive element, including in the pressed/hover state.

### Radius

**`rounded-none` on every structural primitive — cards, buttons, inputs, dropdowns, badges, table cells.** This is the one universal rule with no per-component exceptions. Sharp corners are as much a part of the brutalist signature as the border/shadow language; a stray rounded corner reads as a bug, not a variation.

---

## 5. Component Specifications

### Buttons

- **Primary:** `border-2 border-zinc-100 bg-violet-600 text-white font-medium rounded-none px-4 py-2 shadow-brutal-violet hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`
- **Secondary:** `border-2 border-zinc-100 bg-zinc-900 text-zinc-100 font-medium rounded-none px-4 py-2 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`
- **Ghost:** `border-2 border-transparent text-zinc-400 font-medium rounded-none px-4 py-2 hover:border-zinc-100 hover:bg-zinc-900 hover:text-zinc-100 transition-colors` — flat by default (no shadow), only gains a border on hover; this is what visually distinguishes it from primary/secondary's constant "raised" look, not a color difference
- **Danger:** `border-2 border-zinc-100 bg-red-600 text-white font-medium rounded-none px-4 py-2 shadow-brutal-red hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all` (destructive actions only — deleting a project, etc.)
- All buttons: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none` — a disabled button keeps its resting shadow (it can't be "pressed"), which correctly reads as unavailable
- Focus: `focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950` — independent of and stacked with the hover-press state

### Form Inputs

- `bg-zinc-950 border-2 border-zinc-100 rounded-none px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500`
- Focus: `focus:border-violet-500 focus:shadow-brutal-violet-sm focus:outline-none` — the border swaps color _and_ a small hard shadow appears, a clear "now editing" state change
- Error: `border-red-500 focus:shadow-brutal-red-sm` with helper text `text-red-400 text-xs mt-1.5`
- Every input has a visible `<label className="text-sm font-medium text-zinc-300">` — never placeholder-as-label.

### Cards

- `bg-zinc-900 border-2 border-zinc-100 shadow-brutal rounded-none p-6` (member-facing, spacious) or `p-4` (manager-facing, dense — see §6)
- Hero/emphasis variant: `shadow-brutal-lg` in place of `shadow-brutal`
- Card title: `text-base font-bold text-zinc-100`, optionally with a `text-zinc-400 text-sm` subtitle line beneath

### Status Badges

`border-2 rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-transparent` using the §2 status table. Example (`SUBMITTED`): `border-2 border-emerald-500 text-emerald-400 bg-transparent rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider`.

### Data Tables (Manager Dashboard)

- Header row: `bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border-b-2 border-zinc-100`
- Rows: `border-b border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-sm transition-colors`
- No zebra striping — hover is the only row-differentiation device.
- Dense padding: `py-2.5 px-4` per cell (see §6 for why manager views run tighter than member views).
- Wrap in `overflow-x-auto` for mobile.
- Any per-row icon-only interactive control (expand/collapse, unassign) must be a real `<button>` with an `aria-label` naming the row's subject — never a bare `<tr onClick>` with no keyboard path.

### Charts (Recharts)

- Grid lines: `stroke="#27272a"` (`zinc-800`)
- Axis text: `fill="#a1a1aa"` (`zinc-400`)
- Tooltip: `bg-zinc-900`, `2px solid #f4f4f5` border (matches the universal structural border, not a translucent hairline), no border-radius
- Primary series color: violet (`#7c3aed` / `#8b5cf6`)
- Status-breakdown series: reuse the §2 status colors (emerald/red/amber) so a chart and a badge for the same status always match
- Always wrap in Recharts' `ResponsiveContainer`
- Wrap the chart container in `role="img"` with a text `aria-label` summarizing the data — Recharts' SVG output exposes no text content to screen readers otherwise

### Navigation (Sidebar / Navbar)

- Container: `bg-zinc-950 border-r-2 border-zinc-100` (sidebar) / `border-b-2 border-zinc-100` (top navbar)
- Active link: `bg-violet-600 text-white border-2 border-zinc-100 rounded-none font-medium` — solid fill, not a translucent tint
- Inactive link: `text-zinc-400 border-2 border-transparent hover:border-zinc-100 hover:bg-zinc-900 hover:text-zinc-100 rounded-none`
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

- Centered card (`max-w-sm`) on the plain `bg-zinc-950` canvas — the card's own border + hard shadow provide all the contrast needed, no secondary background color
- Single column, `space-y-5` between fields
- App name/logo above the form, `text-zinc-100`

### Team Member — Personal Report Page

- Top navbar (`bg-zinc-950 border-b-2 border-zinc-100`), full width, single row at every viewport (see §8)
- Below it: the centered form per §6
- Report history renders beneath, organized by week, most recent first

### Manager — Team Dashboard Page

- Sidebar (§5) + main content area
- **Top:** metric cards, `grid-cols-1 md:grid-cols-3`, compliance rate emphasized per §6
- **Middle:** 2-3 Recharts charts, `grid-cols-1 lg:grid-cols-2` or `lg:grid-cols-3`
- **Bottom:** filterable data table of all team reports (§5's dense table spec)
- **Floating chat widget** (bonus, if implemented): bottom-right, `bg-zinc-900 border-2 border-zinc-100 shadow-brutal rounded-none`, toggleable

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

| Pair                                                                  | Ratio             | AA body (4.5:1) | AA large/UI (3:1)                 |
| --------------------------------------------------------------------- | ----------------- | --------------- | --------------------------------- |
| `zinc-100` text on `zinc-950`                                         | 18.1:1            | Pass            | Pass                              |
| `zinc-300` text on `zinc-900`                                         | 12.0:1            | Pass            | Pass                              |
| `zinc-400` text on `zinc-950`                                         | 7.8:1             | Pass            | Pass                              |
| `zinc-500` text on `zinc-950` (placeholder only)                      | 4.1:1             | **Fail**        | Pass                              |
| `violet-400` text on `zinc-950`                                       | 7.3:1             | Pass            | Pass                              |
| `violet-300`/`violet-400` text on `zinc-900`                          | 9.6:1 / 6.5:1     | Pass            | Pass                              |
| White text on `violet-600` (primary button fill)                      | 5.7:1             | Pass            | Pass                              |
| White text on `red-600` (danger button fill)                          | 4.8:1             | Pass            | Pass                              |
| **`zinc-100` border on `zinc-950`** (structural border)               | 18.1:1            | —               | Pass                              |
| **`zinc-700` border on `zinc-950`**                                   | 1.9:1             | —               | **Fail** — do not use as a border |
| **`zinc-600` border on `zinc-950`**                                   | 2.6:1             | —               | **Fail** — do not use as a border |
| **`zinc-500` border on `zinc-950`** (muted border floor)              | 4.1:1             | —               | Pass                              |
| `emerald-500` / `red-500` / `amber-500` border on `zinc-950` (badges) | 7.8 / 5.3 / 9.3:1 | —               | Pass                              |
| `violet-500` focus ring on `zinc-950`                                 | 4.7:1             | —               | Pass                              |

**Binding rules that follow directly from this table:**

1. Never use `zinc-500` for body text, labels, or captions — placeholder text only.
2. **Never use `zinc-600` or `zinc-700` as a border color** — both fail the 3:1 non-text contrast minimum against `zinc-950`. If a border needs to be visually muted (not the default structural `zinc-100`), the floor is `zinc-500`.
3. The structural border is always `zinc-100` — this isn't just an aesthetic default, it's the only zinc tone in the muted range that's unambiguously safe at every weight, so standardizing on it avoids re-deriving this contrast math per component.
4. Button hover/press states swap shadow + position (§4), never rely on a color-only change that could fail contrast — this sidesteps the darken-vs-lighten contrast question the previous system had to solve for button fills entirely.
5. Focus rings always specify `ring-offset-zinc-950` (or `zinc-900` inside a solid card) — never rely on the browser's default white offset.
6. All interactive elements are keyboard-navigable; semantic HTML (`<button>`, `<nav>`, `<main>`, `<form>`, `<table>`) throughout; every icon-only control gets an `aria-label`; multiple instances of the same control on one page (e.g. a table's per-row "Edit" button) get a **row-specific** `aria-label`, not a generic one.
7. Inline prose links carry an always-on underline (§5) — don't rely on color alone to signal "this is a link."
8. If a new color or border pairing is introduced later that isn't in the table above, verify it the same way (relative-luminance contrast ratio, remembering borders need the 3:1 non-text threshold, not 4.5:1) before shipping it — don't eyeball dark-mode contrast, it's notoriously easy to get wrong by feel.
