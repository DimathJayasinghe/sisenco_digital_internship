# Git Workflow, Branching & Repository Management

This document is the authoritative reference for how source control is managed on this project. It complements the commit rules in `CODING_STANDARDS.md §7` and `AGENT_RULES.md §6` and takes precedence where they overlap. All agents and contributors must follow it.

---

## 1. Repository Model

*   **Single monorepo** (Turborepo) holding `apps/api`, `apps/web`, and `packages/*`. One repo, one history, one issue tracker.
*   **`main` is always deployable.** It must build, lint, typecheck, and (where present) pass tests at every commit. Never commit broken code to `main`.
*   **No direct commits to `main`.** All changes land through a short-lived feature branch and a Pull Request — even solo work. This keeps history reviewable and the assignment presentation credible.
*   **`.env*` and `node_modules/` are never committed.** They must be listed in the root `.gitignore`. Provide `.env.example` files with placeholder values instead.

---

## 2. Branching Model

A lightweight **trunk-based** flow — one long-lived branch (`main`) plus short-lived topic branches. No `develop`/`release` branches; they are overkill for this project's scope.

### Branch naming
`<type>/<short-kebab-summary>` — the `<type>` matches the Conventional Commit types.

| Type | Use for | Example |
|---|---|---|
| `feat/` | New feature | `feat/report-submission` |
| `fix/` | Bug fix | `fix/auth-cookie-samesite` |
| `refactor/` | Restructure without behaviour change | `refactor/reports-service-split` |
| `chore/` | Tooling, config, deps | `chore/turborepo-pipeline` |
| `docs/` | Documentation only | `docs/er-diagram` |
| `test/` | Tests only | `test/reports-e2e` |

Rules:
*   Keep branches **short-lived** (hours to a couple of days) and **narrowly scoped** — one feature or fix per branch.
*   Branch from the latest `main`; rebase on `main` before opening the PR to keep history linear.
*   Delete the branch after merge.

### Alignment with execution phases
Work proceeds in the phase order fixed by `AGENT_RULES.md`: **Backend → Frontend → AI Integration.** Branch names should make the phase obvious, e.g. `feat/api-auth-module`, then `feat/web-report-page`, then `feat/ai-chat-assistant`.

---

## 3. Commit Standards

*   **Conventional Commits**, strictly: `type(scope): subject`.
    *   `type` — one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`.
    *   `scope` — the module/area, lowercase: `auth`, `reports`, `projects`, `dashboard`, `ai`, `web`, `db`, `shared-types`.
    *   `subject` — imperative mood, no trailing period, ≤ ~72 chars. *"add DRAFT → SUBMITTED transition"*, not *"added"* / *"adds"*.
*   Example: `feat(reports): add DRAFT to SUBMITTED status transition endpoint`.
*   **Small, atomic commits** — one logical change each. A commit should compile on its own. Don't mix a refactor with a feature.
*   Use the commit **body** (after a blank line) to explain *why* when the change is non-obvious. Reference issues with `Closes #12`.
*   Never commit secrets, generated artifacts, or `console.log`/debug leftovers.

---

## 4. Pull Request Process

1.  **Open a PR** from the topic branch into `main`. Title = the primary Conventional Commit line.
2.  **PR description must cover:** what changed, why, how it was verified (commands run / screenshots), and any follow-ups. Link the requirement it satisfies (e.g. "Assignment §2 — Personal Report Page").
3.  **Green checks required before merge:** lint (zero warnings), typecheck (`strict`, zero `any`), build, and tests where present. CI or the pre-commit hooks enforce this.
4.  **Self-review the diff** before requesting review — no dead code, no commented-out blocks, no stray files.
5.  **Merge strategy: Squash and merge.** One clean, Conventional-Commit-formatted commit per PR on `main`. This keeps `main` history readable for the presentation. Delete the branch on merge.
6.  Keep PRs **small and focused** — a reviewer should grasp the whole change in one sitting. Split large features across sequential PRs.

---

## 5. Keeping Branches Current

*   **Rebase, don't merge, onto `main`** for topic branches: `git fetch origin && git rebase origin/main`. This avoids noisy merge commits.
*   Resolve conflicts locally and re-run lint/typecheck/tests after a rebase.
*   Only force-push to **your own** topic branch (`git push --force-with-lease`) — never to `main`.

---

## 6. Repository Hygiene

*   **`.gitignore`** (root) must cover: `node_modules/`, `.env`, `.env.local`, `.env.*.local`, build outputs (`dist/`, `.next/`, `.turbo/`), coverage, editor folders, and Prisma-generated client if applicable.
*   **`.env.example`** is committed and kept in sync whenever a new env var is introduced (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `ANTHROPIC_API_KEY`).
*   **Lockfile** (`package-lock.json`) is committed and treated as source of truth — never hand-edit it.
*   **Database migrations** (`prisma/migrations/`) are committed. Never edit an applied migration; create a new one. Never modify the database out-of-band.
*   **No large binaries** in the repo. Diagrams/video are linked (as the deliverables specify), not committed.

---

## 7. Automation (Pre-Commit & CI)

*   **Husky + lint-staged** run ESLint and Prettier on staged files at pre-commit — a commit that fails lint/format is rejected locally.
*   **Commit message linting** (optional but recommended): enforce Conventional Commits via `commitlint` on `commit-msg`.
*   **CI on every PR** runs the Turborepo pipeline: `lint`, `typecheck`, `build`, `test`. `main` is protected — PRs cannot merge with a failing pipeline.

---

## 8. Quick Reference

```bash
# start work
git switch main && git pull --ff-only
git switch -c feat/report-submission

# ... commit in small atomic steps ...
git add -p
git commit -m "feat(reports): add submit endpoint with LATE derivation"

# stay current before opening the PR
git fetch origin && git rebase origin/main

# publish and open PR (squash-merge into main, then delete branch)
git push -u origin feat/report-submission
```
