# Git Workflow, Branching & Repository Management

This document is the authoritative reference for how source control is managed on this project. It complements the commit rules in `CODING_STANDARDS.md §7` and `AGENT_RULES.md §6` and takes precedence where they overlap. All agents and contributors must follow it.

---

## 1. Repository Model

- **Single monorepo** (Turborepo) holding `apps/api`, `apps/web`, and `packages/*`. One repo, one history, one issue tracker.
- **Two long-lived branches:**
  - **`main`** — the production-ready snapshot. Only ever updated by merging `dev` in once a batch of work is stable. This is the branch shared for the assignment deliverable.
  - **`dev`** — the integration branch. Branched from `main`. Every feature/fix/chore branch targets `dev`, not `main`. This is where day-to-day work lands.
- **No direct commits to `main` or `dev`.** All changes land through a short-lived topic branch and a Pull Request — even solo work. This keeps history reviewable and the assignment presentation credible.
- **`main` is always deployable.** It must build, lint, typecheck, and (where present) pass tests at every commit. `dev` should also stay green, but a brief red state while a feature is mid-flight is tolerated there — it must never leak to `main`.
- **`.env*` and `node_modules/` are never committed.** They must be listed in the root `.gitignore`. Provide `.env.example` files with placeholder values instead.

---

## 2. Branching Model

A **two-tier trunk-based** flow: `main` (release) ← `dev` (integration) ← short-lived topic branches. No `release/*` branches beyond this; that would still be overkill for this project's scope.

```
main ──────────────────●─────────────●────────►  (promoted from dev when stable)
                        ▲             ▲
dev ──●──●──●──●──●──●──┴──●──●──●──●─┴──●──►  (every topic branch PRs in here)
      │  │  │  │  │  │     │  │  │  │
     feat fix feat ...    feat feat ...
```

### Branch naming

`<type>/<short-kebab-summary>` — the `<type>` matches the Conventional Commit types.

| Type        | Use for                              | Example                          |
| ----------- | ------------------------------------ | -------------------------------- |
| `feat/`     | New feature                          | `feat/report-submission`         |
| `fix/`      | Bug fix                              | `fix/auth-cookie-samesite`       |
| `refactor/` | Restructure without behaviour change | `refactor/reports-service-split` |
| `chore/`    | Tooling, config, deps                | `chore/turborepo-pipeline`       |
| `docs/`     | Documentation only                   | `docs/er-diagram`                |
| `test/`     | Tests only                           | `test/reports-e2e`               |

Rules:

- Keep branches **short-lived** (hours to a couple of days) and **narrowly scoped** — one feature or fix per branch.
- **Branch from the latest `dev`** (never from `main` directly); rebase on `dev` before opening the PR to keep history linear.
- PR target is **`dev`**.
- **Do not delete branches after merge — topic branches and `dev` are both kept.** They're a record of the work; deleting them after a squash-merge is the default GitHub behavior but is explicitly overridden here.

### Promoting `dev` → `main`

- Once a meaningful, stable slice of work is done (e.g. "Phase 1 backend complete", or a set of modules that are individually merged and verified) and `dev` builds/lints/typechecks cleanly, open a PR from `dev` into `main`.
- **Merge strategy for this PR only: a regular merge commit (not squash).** `dev` already contains one squashed commit per feature (see §4) — merging it into `main` with a merge commit preserves that per-feature history on `main` instead of collapsing an entire phase into one commit. Do **not** delete `dev` after this merge; it's long-lived and immediately continues taking new topic branches.
- Since `main` never receives any other commits, this is normally a fast-forward-able merge — GitHub still records it as an explicit merge so the promotion point is visible in history.

### Alignment with execution phases

Work proceeds in the phase order fixed by `AGENT_RULES.md`: **Backend → Frontend → AI Integration.** Branch names should make the phase obvious, e.g. `feat/api-auth-module`, then `feat/web-report-page`, then `feat/ai-chat-assistant`. A phase boundary is a natural (but not mandatory) point to promote `dev` → `main`.

---

## 3. Commit Standards

- **Conventional Commits**, strictly: `type(scope): subject`.
  - `type` — one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`.
  - `scope` — the module/area, lowercase: `auth`, `reports`, `projects`, `dashboard`, `ai`, `web`, `db`, `shared-types`.
  - `subject` — imperative mood, no trailing period, ≤ ~72 chars. _"add DRAFT → SUBMITTED transition"_, not _"added"_ / _"adds"_.
- Example: `feat(reports): add DRAFT to SUBMITTED status transition endpoint`.
- **Small, atomic commits** — one logical change each. A commit should compile on its own. Don't mix a refactor with a feature.
- Use the commit **body** (after a blank line) to explain _why_ when the change is non-obvious. Reference issues with `Closes #12`.
- Never commit secrets, generated artifacts, or `console.log`/debug leftovers.

---

## 4. Pull Request Process

1.  **Open a PR** from the topic branch into **`dev`**. Title = the primary Conventional Commit line.
2.  **PR description must cover:** what changed, why, how it was verified (commands run / screenshots), and any follow-ups. Link the requirement it satisfies (e.g. "Assignment §2 — Personal Report Page").
3.  **Green checks required before merge:** lint (zero warnings), typecheck (`strict`, zero `any`), build, and tests where present. CI or the pre-commit hooks enforce this.
4.  **Self-review the diff** before requesting review — no dead code, no commented-out blocks, no stray files.
5.  **Merge strategy: Squash and merge** into `dev`. One clean, Conventional-Commit-formatted commit per PR. **Do not delete the branch on merge** — keep it (see §2).
6.  Keep PRs **small and focused** — a reviewer should grasp the whole change in one sitting. Split large features across sequential PRs.
7.  Merging one topic branch into `dev` moves `dev`'s tip forward, so **immediately rebase any other still-open topic branches onto the new `dev`** before they're next in line to merge (see §5) — otherwise their diff balloons to include already-merged work.
8.  The separate **`dev` → `main` promotion PR** (§2) follows the same review bar (green checks, self-review) but uses a merge commit, not squash.

---

## 5. Keeping Branches Current

- **Rebase, don't merge, onto `dev`** for topic branches: `git fetch origin && git rebase origin/dev`. This avoids noisy merge commits.
- If a topic branch was itself branched from another not-yet-merged topic branch (a stacked branch), rebase it with `git rebase --onto origin/dev <old-parent-tip> <branch>` once the parent merges, so only its own commits replay onto the new `dev`.
- Resolve conflicts locally and re-run lint/typecheck/tests after a rebase.
- Only force-push to **your own** topic branch (`git push --force-with-lease`) — never to `dev` or `main`.
- **Known GitHub quirk (now moot under the keep-all-branches rule):** if a PR's base branch is deleted, GitHub auto-**closes** the PR rather than retargeting it, instead of just retargeting it. This bit us once, while branches were still being deleted after merge, on a stacked PR whose base got deleted out from under it — the fix was rebasing onto `dev` and opening a fresh PR. Since branches are no longer deleted, this can't recur, but the recovery steps are worth keeping in mind: retarget the PR's base to `dev`, or if it already auto-closed, rebase onto `dev` and open a fresh PR (same content, new number).

---

## 6. Repository Hygiene

- **`.gitignore`** (root) must cover: `node_modules/`, `.env`, `.env.local`, `.env.*.local`, build outputs (`dist/`, `.next/`, `.turbo/`), coverage, editor folders, and Prisma-generated client if applicable.
- **`.env.example`** is committed and kept in sync whenever a new env var is introduced (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `GEMINI_API_KEY`).
- **Lockfile** (`package-lock.json`) is committed and treated as source of truth — never hand-edit it.
- **Database migrations** (`prisma/migrations/`) are committed. Never edit an applied migration; create a new one. Never modify the database out-of-band.
- **No large binaries** in the repo. Diagrams/video are linked (as the deliverables specify), not committed.

---

## 7. Automation (Pre-Commit & CI)

- **Husky + lint-staged** run ESLint and Prettier on staged files at pre-commit — a commit that fails lint/format is rejected locally.
- **Commit message linting** (optional but recommended): enforce Conventional Commits via `commitlint` on `commit-msg`.
- **CI on every PR** runs the Turborepo pipeline: `lint`, `typecheck`, `build`, `test`. Both `main` and `dev` are protected — PRs cannot merge with a failing pipeline.

---

## 8. Quick Reference

```bash
# start work — branch from dev, not main
git switch dev && git pull --ff-only
git switch -c feat/report-submission

# ... commit in small atomic steps ...
git add -p
git commit -m "feat(reports): add submit endpoint with LATE derivation"

# stay current before opening the PR
git fetch origin && git rebase origin/dev

# publish and open PR (target dev, squash-merge — do NOT delete the branch)
git push -u origin feat/report-submission
gh pr create --base dev --head feat/report-submission --title "feat(reports): add submit endpoint with LATE derivation"
gh pr merge --squash   # no --delete-branch

# ...later, once dev is stable and a batch of features is verified...
# promote dev -> main with a merge commit (not squash)
gh pr create --base main --head dev --title "chore: promote dev to main"
gh pr merge --merge   # NOT --squash — keeps dev's per-feature commits on main
```
