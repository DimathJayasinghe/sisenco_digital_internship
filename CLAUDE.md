# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

**Weekly Report Generator & Team Dashboard** — a full-stack app where team members submit fixed-format weekly reports and managers analyze them on a dashboard. This is an internship technical assignment (`AGENTS/technical_assignment.md` is the employer's source-of-truth requirements).

**Current state: greenfield.** The repo intentionally contains only the `AGENTS/` specification docs and `CLAUDE.md` — the application scaffold was deliberately deleted to build fresh from the specs. Prior scaffold files still exist in git history (`git show HEAD:apps/api/...`) but are not on disk. Do not assume any app code exists until you create it.

## Read the session log first

At the start of a session, read **`CHAT_HISTORY.md`** (repo root, gitignored/local-only) before doing anything else. It's a condensed running log of decisions, current state, and open TODOs — cheaper than re-deriving context from the full spec. **Keep it updated** as work progresses: append terse dated entries and refresh the "Project snapshot" / "Open questions" sections when they change.

## Spec-driven: read the docs first

The `AGENTS/` directory is the **authoritative specification**, not background reading. Before implementing anything, read them in the order defined by `AGENTS/AGENT_RULES.md §0`. When docs and intuition conflict, the docs win; if the docs themselves conflict, stop and ask.

| Doc | Authority over |
|---|---|
| `technical_assignment.md` | The actual requirements (do not edit — it's the employer's text) |
| `PROJECT_IDEA.md` | Scope, user journeys, feature list |
| `ARCHITECTURE.md` | Folder structure, all API endpoints, response format, auth flow |
| `DATABASE.md` | Prisma schema, constraints, **and status/compliance semantics (§5)** |
| `SECURITY_GUIDELINES.md` | Auth, RBAC, validation, env vars |
| `CODING_STANDARDS.md` | Naming, SOLID, layer separation |
| `GIT_WORKFLOW.md` | Branching, commits, PR process |
| `UI_UX_DESIGN.md` | Design tokens, component specs, layouts |

`AGENT_RULES.md §1` is a standing instruction: **ask when a requirement is ambiguous rather than inventing an answer.**

## Planned architecture (big picture)

Turborepo monorepo, strict TypeScript end-to-end:

- `apps/api` — **NestJS** REST API, prefix `/api/v1`, per-feature modules (`auth`, `users`, `reports`, `projects`, `dashboard`, `ai`), Prisma over **Neon serverless PostgreSQL**. Runs on `:3001`.
- `apps/web` — **Next.js 14 App Router** + TailwindCSS + TanStack Query + Recharts. Runs on `:3000`, proxies to the API so requests stay same-origin.
- `packages/shared-types` — the **single source of truth for all shared TS interfaces/enums**. Both apps import from here; never duplicate a type in an app.

## Cross-cutting invariants (get these wrong and the app is wrong)

These aren't in any single doc — they're the load-bearing decisions:

- **RBAC is enforced twice.** Backend: `JwtAuthGuard` + `RolesGuard`/`@Roles('MANAGER')` reading role from the *validated JWT payload only*. Frontend: `middleware.ts` gates `/(member)/*` and `/(manager)/*` routes. Both layers are required.
- **Data ownership from the token, never the request.** Member report queries filter by `userId` extracted from the JWT — never trust a client-supplied `userId`.
- **Auth = one stateless access-token JWT** in an `HttpOnly; Secure; SameSite=Strict` cookie. No refresh-token flow (deliberately out of scope). Never put tokens in `localStorage`.
- **Registration always creates `TEAM_MEMBER`.** Client-supplied roles are ignored. The first `MANAGER` comes from the Prisma seed; promotion is via `PATCH /users/:id`.
- **Report fields are fixed and non-customizable** by end users (week range, project tag, tasks completed, tasks planned, blockers, hours [opt], notes [opt]). Do not add/remove fields.
- **One report per member per week** — `UNIQUE(user_id, week_start_date)`. The single `project_id` is a tag on that one report.
- **Status semantics (`DATABASE.md §5`):** `DRAFT`/`SUBMITTED`/`LATE` are stored; `PENDING` is *derived* (no submitted report for an expected member). `LATE` is decided at submit-time by comparing `now()` to `week_end_date + SUBMISSION_GRACE_DAYS` — no background job. Compliance = submitted members / active `TEAM_MEMBER` count.
- **DB is snake_case, TS is camelCase** — bridge every field/model with Prisma `@map`/`@@map`. Soft-delete projects via `is_active`; never hard-delete (preserves report history).
- **Layer separation (backend):** controllers do HTTP only; services hold business logic *and* inject `PrismaService` directly (no separate repository layer); global `ValidationPipe` with `{ whitelist, forbidNonWhitelisted, transform }`; errors formatted via an exception filter into the standard `{ statusCode, message, data }` envelope (`ARCHITECTURE.md §4`).
- **Zero `any`, `strict: true`** in every tsconfig. Server state on the frontend goes through TanStack Query hooks — no `useEffect`+`fetch`.

## Execution order

Build in phases, strictly: **Backend → Frontend → AI (bonus)** (`AGENT_RULES.md §5`).

## Git workflow

No direct commits to `main`. Work on a `<type>/<summary>` branch (types match Conventional Commits) and land via squash-merged PR. Commit messages are Conventional Commits: `type(scope): subject`. Full rules in `AGENTS/GIT_WORKFLOW.md`.

## Commands

The workspace is not scaffolded yet, so these don't exist on disk — they are the intended Turborepo shape to create and then use:

```bash
npm install                          # root — installs all workspaces
npm run dev                          # turbo — runs api + web together
npm run lint                         # turbo — ESLint across workspaces (zero warnings)
npm run build                        # turbo — typecheck + build all

# scoped to one app
npm run dev  --workspace apps/api
npm run test --workspace apps/api    # (single test: pass a Jest name/path filter)

# database (from apps/api)
npx prisma migrate dev               # apply schema changes as a new migration
npx prisma db seed                   # seed roles + bootstrap MANAGER
```

Once scaffolded, update this section with the exact scripts defined in the root and app `package.json` files.
