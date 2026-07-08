# Progress Tracker — Weekly Report Generator & Team Dashboard

Local, working tracker for development. Not a spec — `AGENTS/*.md` remains authoritative.
Update this file as tasks move: check items off, add dated notes under "Log" for anything
non-obvious (decisions, deviations, blockers).

## Objective

Build the full-stack app per `AGENTS/technical_assignment.md`, in strict phase order:
**Backend → Frontend → AI (bonus)** (`AGENT_RULES.md §5`). Monorepo already scaffolded
(Turborepo, NestJS `apps/api`, Next.js `apps/web`, `packages/shared-types`), Prisma schema
and seed already written, Docker Compose stack builds successfully. Feature modules
(`auth`, `users`, `reports`, `projects`, `dashboard`, `ai`) currently exist only as empty
`@Module({})` stubs — this tracker starts from there.

## Phase 1 — Backend (NestJS API)

### 1.1 Auth Module — DONE (`feat/api-auth-module`)

- [x] `JwtStrategy` (passport-jwt) — reads token from the `HttpOnly` cookie, validates, returns `AuthUser`
- [x] `JwtAuthGuard` — global guard, respects `@Public()` to bypass
- [x] `RegisterDto` / `LoginDto` with class-validator decorators
- [x] `AuthService` — register (always `TEAM_MEMBER`, bcrypt hash ≥12 rounds), login (bcrypt compare, generic error), issue JWT
- [x] `AuthController` — `POST /auth/register`, `POST /auth/login` (sets `HttpOnly; Secure; SameSite=Strict` cookie), `POST /auth/logout` (clears cookie), `GET /auth/me`
- [x] Wire `JwtAuthGuard` + `RolesGuard` as global `APP_GUARD`s in `AppModule` (Jwt before Roles, so `request.user` is populated first)
- [x] Strict throttling on `/auth/login` and `/auth/register` (10 req/60s, via `@Throttle({ default: { limit: 10, ttl: 60_000 } })`)
- [x] Smoke-tested end-to-end against the Dockerized stack: register (always TEAM_MEMBER, client `role` field rejected by `forbidNonWhitelisted`), duplicate-email 409, wrong-password generic 401, `/me` with/without cookie, logout clears cookie. Cookie flags confirmed: `HttpOnly; Secure; SameSite=Strict; Max-Age=604800`.

### 1.2 Users Module — DONE (`feat/api-users-module`)

- [x] `UsersService` (findAll, findOne, update incl. role reassignment — excludes `passwordHash` via shared `toSafeUser` mapper)
- [x] `UpdateUserDto` (firstName/lastName/role, all optional)
- [x] `UsersController` — `GET /users`, `GET /users/:id`, `PATCH /users/:id` (all Manager-only via `@Roles(Role.MANAGER)`)
- [x] Extracted `toSafeUser`/`UserWithRole` out of `AuthService` into `common/mappers/user.mapper.ts` (was about to be duplicated — DRY)
- [x] `ParseUUIDPipe` on `:id` params for clean 400s on malformed ids
- [x] Smoke-tested: manager can list/get/patch, team member gets 403, unauthenticated gets 401, bad UUID gets 400, missing user gets 404, role promotion via PATCH confirmed end-to-end (RolesGuard exercised for the first time)

### 1.3 Projects Module — DONE, including member assignment (`feat/api-projects-module`, `feat/api-project-members`)

- [x] `CreateProjectDto` / `UpdateProjectDto`
- [x] `ProjectsService` (CRUD + soft-delete via `is_active`, unique-name conflict check on create/rename)
- [x] `ProjectsController` — `GET /projects` (any authenticated user), `POST` / `PATCH /:id` / `DELETE /:id` (Manager-only)
- [x] `toProjectDto` mapper added alongside `toSafeUser` in `common/mappers`
- [x] Smoke-tested: unauthenticated 401, team member can list but not write (403), manager full CRUD, duplicate-name 409, soft-delete removes from the active list (`GET /projects` only returns `isActive: true`), 404 on missing id, `forbidNonWhitelisted` rejects a client-supplied `isActive`
- [x] `POST /projects/:id/members` / `DELETE /projects/:id/members/:userId` (Manager-only) — added `ProjectMember` to `shared-types` (not previously defined), `AssignMemberDto`, `toProjectMemberDto` mapper. Validates both the project and the user exist (project 404, user 404), rejects a duplicate assignment with 409, unassigning a non-assignment is a 404.
- [x] **Enforcement (added `feat/api-reports-enforce-project-assignment`):** `ReportsService.assertProjectAccessible()` now enforces `DATABASE.md §3`'s stated purpose for `user_projects` — if a member has _any_ assignments at all, `projectId` on create/update must be one of them (403 `"You are not assigned to this project"` otherwise); a member with zero assignments stays unrestricted (assignment is opt-in per project, not mandatory team-wide). Smoke-tested both branches: an assigned-and-restricted member blocked from an unassigned project, and an unrestricted member (no assignments) unaffected.
- [x] Smoke-tested: 403/401 boundaries, successful assign (returns the `ProjectMember` with embedded `user`), duplicate-assignment 409, assign-nonexistent-user 404, assign-to-nonexistent-project 404, successful unassign (`{success:true}`), unassign-again 404, malformed UUID 400, `forbidNonWhitelisted` rejects extra fields

### 1.4 Reports Module — DONE (`feat/api-reports-module`)

- [x] `CreateReportDto` / `UpdateReportDto` (fixed fields only, per `DATABASE.md`). **Design decision (user-confirmed):** client sends only `weekStartDate`; the server always derives `weekEndDate = weekStartDate + 6 days` (fixed 7-day week), so every member's weeks align to the same boundaries for dashboard aggregation.
- [x] `FindReportsQueryDto` — Manager filters: `userId`, `projectId`, `startDate`/`endDate` range on `weekStartDate`
- [x] `ReportsService` — create (DRAFT, validates project is active per `SECURITY_GUIDELINES.md §6`), update (DRAFT-only, owner-only — not Manager, per `ARCHITECTURE.md`'s "Owner (DRAFT only)"), submit (DRAFT→SUBMITTED/LATE via `DATABASE.md §5`'s deadline formula: `now() > week_end_date + SUBMISSION_GRACE_DAYS` ⇒ LATE), findMine, findOne (owner or Manager), findAll (Manager, with filters)
- [x] `ReportsController` — all six endpoints from `ARCHITECTURE.md §3`; route order matters (`GET /reports/my` declared before `GET /reports/:id}` so Express doesn't swallow it as an id param)
- [x] `UNIQUE(user_id, week_start_date)` conflict → clean 409, both on create and on changing `weekStartDate` via PATCH (excludes self)
- [x] `common/mappers/report.mapper.ts` — `toReportWithRelationsDto` embeds `project` + `user` summary (matches shared-types' `ReportWithRelations`); handles the Prisma `ReportStatus` enum → shared-types enum cast (same pattern as `Role` in `user.mapper.ts`) and `Decimal` → `number` for `hoursWorked`
- [x] Smoke-tested extensively against the Dockerized stack: unauthenticated 401, Manager forbidden from creating/submitting (TEAM_MEMBER-only), team member forbidden from `GET /reports` (Manager-only), cross-member read denied (403), Manager can read any report but _cannot_ PATCH another member's report (PATCH is owner-only, not Manager), duplicate-week 409, inactive/nonexistent `projectId` 400, `forbidNonWhitelisted` rejects a client-supplied `status`, DRAFT→LATE for a past-deadline week vs DRAFT→SUBMITTED for the current week (verified both branches of the deadline logic with real dates), re-submit 409, PATCH-after-submit 403, all four Manager query filters (`userId`, date range, invalid UUID → 400, unfiltered)

### 1.5 Dashboard Module — DONE (`feat/api-dashboard-module`)

- [x] `getCurrentWeekStart()` — canonical "current week" = most recent Monday on/before now, UTC. Only well-defined because reports are now required to start on a Monday (see `fix/reports-monday-week-start`).
- [x] `DashboardService.getSummary()` — `DATABASE.md §5`'s compliance formula exactly: `expectedMembers` = count of `TEAM_MEMBER` users, `submittedMembers`/`totalSubmittedThisWeek` = count of SUBMITTED+LATE reports for the current week (same number, since `UNIQUE(user_id, week_start_date)` means 1 report = 1 member), `pendingMembers = expected - submitted`, `complianceRate = submitted / expected` (0 when expected is 0)
- [x] `getSummary()`'s `openBlockers` — **heuristic, flagged as such:** `blockers` is required free text (no boolean "is this open" column exists), so a report counts as having an open blocker unless its trimmed/lowercased text is in a small set (`none`, `n/a`, `na`, `no blockers`, `nothing`, `-`). Windowed to the current week, SUBMITTED+LATE only. Documented in `dashboard.constants.ts`.
- [x] `getTrend()` — submitted/late report count grouped by `weekStartDate`, all weeks on record (no artificial cutoff)
- [x] `getStatusByMember()` — every `TEAM_MEMBER`, current week; DRAFT or no report both read as `PENDING` per `DATABASE.md §5`
- [x] `getWorkloadByProject()` — report count + summed hours per project, SUBMITTED+LATE only
- [x] `getActivityFeed()` — most recent 20 SUBMITTED/LATE reports, newest `submittedAt` first
- [x] `DashboardController` — all five endpoints, all Manager-only (`@Roles(Role.MANAGER)` at class level)
- [x] Small refactor while here: extracted `REPORT_RELATIONS` (was private to `ReportsService`) to `common/prisma/report-includes.ts`, and `toIsoDate` (was private to `report.mapper.ts`) to `common/utils/date.util.ts` — both now shared between Reports and Dashboard instead of about to be duplicated
- [x] Smoke-tested against the Dockerized stack with a hand-verified dataset (3 team members, 3 reports across 2 weeks, one real blocker each, one member with no current-week report): every number checked out exactly — compliance `2/3`, `pendingMembers: 1`, status chart showing `SUBMITTED`/`SUBMITTED`/`PENDING`, trend across both weeks, workload totalHours summing correctly (38.5 + 40 + 20 = 98.5), activity feed ordered newest-first. Plus 401/403 boundary checks.

### 1.6 Cross-cutting

- [x] Confirm `ValidationPipe`, `AllExceptionsFilter`, `TransformResponseInterceptor` apply cleanly end-to-end once real endpoints exist — confirmed continuously across every module's manual smoke tests and now the automated e2e suite
- [x] `.env.example` kept in sync with any new env vars — no new env vars introduced since scaffold
- [x] Automated smoke test of every endpoint — `e2e/backend-smoke-test.sh` (113 assertions across all 6 modules, black-box over HTTP against the Dockerized stack). See `e2e/README.md`. Passed clean twice (113/113 both times); one run in between deliberately confirmed the auth rate-limiter trips correctly on rapid back-to-back runs (documented in the README, not a bug).

## Phase 2 — Frontend (Next.js)

Tracked in-session as tasks #1-8 (design system → auth → layout → member report page → manager dashboard → reports table → projects/members → polish pass). Each still lands as its own branch/PR into `dev`, same as Phase 1.

### 2.1 Design System Foundation — DONE (`feat/web-design-system`)

- [x] `tailwind.config.ts` / `globals.css` rewritten to drop the old light-mode CSS-variable token layer — components use Tailwind's stock `zinc`/`violet`/`emerald`/`red`/`amber` classes directly per `AGENTS/UI_UX_DESIGN.md`
- [x] `components/ui/`: `Button` (primary/secondary/ghost/danger, hover-darkens per the verified contrast rule), `Input`, `Textarea` (both label+error built in, auto `useId()`), `Card`, `Badge` (typed directly off `ReportStatus | MemberSubmissionStatus` from `shared-types`, no lowercase-string translation layer)
- [x] Patched the placeholder stub pages (`/`, `/login`, `/register`, `/dashboard`, `/reports`) off the now-deleted old token classes so the app isn't visually broken mid-build
- [x] Verified in an actual browser, not just typecheck/lint: installed Playwright + Chromium in a scratch dir (not a project dependency), ran the dev server, screenshotted `/` and `/login` — glass card border/fill and violet button render exactly as specified

### 2.2 Auth Flow — DONE (`feat/web-auth-flow`)

- [x] `lib/api/client.ts` (moved from `lib/api.ts`), `lib/api/auth.ts` (typed request functions), `lib/api/error.ts` (`getApiErrorMessage` — unwraps the `{statusCode, error, message}` envelope, `message` can be `string | string[]`)
- [x] `hooks/useAuth.ts` — `useCurrentUser` (query, `retry: false` since a 401 just means logged-out), `useLogin`/`useRegister` (mutations, seed the auth query cache on success), `useLogout` (clears the whole query cache, not just auth — nothing should leak across sessions on a shared machine)
- [x] `(auth)/login` + `(auth)/register` pages — plain `useState` controlled forms (no new form-library dependency), native HTML5 validation (`required`/`type="email"`/`minLength`), server error surfaced via `getApiErrorMessage`. Login redirects by role (`MANAGER` → `/dashboard`, else `/reports`) or to `?redirect=` if present; register always lands on `/reports` since registration is always `TEAM_MEMBER`
- [x] `useSearchParams` in the login form required a `Suspense` boundary in `page.tsx` to avoid a `next build` error — extracted into `LoginForm.tsx`
- [x] `middleware.ts` rewritten: decodes (does not verify — that's the backend's job) the JWT payload server-side to read `role`, redirects unauthenticated users to `/login?redirect=...` and `TEAM_MEMBER` away from manager routes to `/unauthorized` (new page), per `SECURITY_GUIDELINES.md §2`. No new dependency — base64url decode via the Edge runtime's built-in `atob`
- [x] Smoke-tested against the real API end-to-end in a headless browser: unauthenticated redirect with correct `?redirect=` param, register → auto-login → `/reports`, wrong-password shows the generic error immediately, correct login redirects by role, `TEAM_MEMBER` blocked from `/dashboard` → `/unauthorized`, `MANAGER` correctly allowed into `/dashboard`
- [x] Hit an environment snag mid-task: the Docker daemon had gone down (containers exited ~3 hours earlier — an environment restart, not something in this session caused it) and needed `docker compose up -d --build` again before the live-API browser tests could run

## Phase 3 — AI Chat Assistant (Bonus)

- [ ] Not started — deferred until Phase 2 is functionally complete

## Open Questions

- **Last-manager demotion:** `PATCH /users/:id` currently lets a Manager demote any user, including themself or the last remaining `MANAGER`, with no floor check. Spec is silent on this. Left as-is (no invented guard) — flag if this should be blocked before Manager routes proliferate further.

## Log

- 2026-07-08 — Started Phase 2 (frontend). Set up an 8-task tracker for the phase. Built the design-system foundation (`feat/web-design-system`, off `dev`): Tailwind config + globals.css rewritten for the new dark system, core `components/ui/` primitives (Button/Input/Textarea/Card/Badge), stub pages patched off the deleted old tokens. Verified in an actual headless browser (Playwright/Chromium installed to a scratch dir, not a project dependency) rather than trusting typecheck alone. Explicitly re-confirmed applying `CODING_STANDARDS.md` §5/§6 (stateless prop-driven primitives, prop-spreading, `cn()` for conditional classes, Tailwind-only styling) — backend-specific instructions elsewhere in `AGENTS/` don't apply to this phase.
- 2026-07-08 — Rewrote `AGENTS/UI_UX_DESIGN.md` from scratch: replaced the old light-mode "modern minimalism" system with a dark-mode zinc/violet/glass-border system (user's direction — zinc-950/900 canvas, `bg-white/5 border-white/10` glass cards instead of shadows, violet-600 primary accent, Inter with tabular-nums for stat numbers). Explicitly scoped as dark-mode only (flagged, not silently assumed). Verified every text/background color pair against the actual WCAG 2.1 contrast formula via a python script rather than eyeballing — this caught a real issue (white-on-violet-500 hover state fails AA body-text contrast at 4.2:1) and fixed it by darkening on hover (violet-600→700, 7.1:1) instead of the more intuitive lighten-on-hover. Also found zinc-500/600 unsafe for real text, restricted to placeholder/decorative use. Added explicit Team-Member-vs-Manager density differentiation (§6) per the user's brief: spacious/centered for the report form, dense/data-grid for the dashboard.
- 2026-07-08 — Updated the branch policy: branches (topic branches and `dev`) are no longer deleted after merge — kept as a record of the work. Updated `AGENTS/GIT_WORKFLOW.md` (branching rules, PR process, keeping-branches-current note, quick reference) and `CLAUDE.md`'s summary accordingly. Everything merged before this point (PRs #1-13) still had its branch deleted per the old policy; this only applies going forward.
- 2026-07-08 — Built `e2e/backend-smoke-test.sh`: a self-contained, safely-re-runnable, black-box HTTP test suite covering all 6 backend modules (113 assertions — auth, users, projects+assignment, reports incl. Monday validation/submit derivation/assignment restriction, dashboard with delta-based assertions). Bash+curl+python3 only, no new dependencies. Ran it three times to validate: clean pass (113/113), an immediate re-run that failed exactly as expected on the auth rate limiter (confirming the throttle works end-to-end, not a bug), then a clean pass again ~65s later. This is the gate for promoting `dev` → `main`.
- 2026-07-08 — Wired project-assignment enforcement into `ReportsService` (`feat/api-reports-enforce-project-assignment`, off `dev`), resolving the open question logged when the assignment endpoints landed. Typecheck/lint/build clean; smoke-tested both branches (restricted member blocked from an unassigned project; unrestricted member unaffected) against fresh test data.
- 2026-07-08 — Implemented the previously-deferred project member-assignment endpoints (`feat/api-project-members`, off `dev`): `POST`/`DELETE /projects/:id/members`. Added `ProjectMember` to `shared-types` (had never been defined). Scoped to pure CRUD on `user_projects` — did not wire enforcement into `ReportsService`, since the spec doesn't mandate it and the feature itself is optional; logged as an open question instead of assuming either way. Typecheck/lint/build clean; smoke-tested full assign/unassign lifecycle plus all boundary/conflict cases.
- 2026-07-08 — Implemented the Dashboard module (`feat/api-dashboard-module`, off `dev`): summary metrics, trend/status/workload charts, activity feed — all Manager-only. Confirmed the open-blockers heuristic and workload/trend windowing choices are reasonable defaults rather than spec-mandated, since `blockers` has no structured "resolved" flag. Typecheck/lint/build clean; smoke-tested against a hand-built dataset with every number verified by hand.
- 2026-07-08 — Added an `@IsMonday()` validator to `CreateReportDto`/`UpdateReportDto.weekStartDate` (`fix/reports-monday-week-start`, off `dev`). Follow-up fix to the already-merged Reports module: confirmed with the user that report weeks must align to a consistent day-of-week (Monday) team-wide, since the upcoming Dashboard module's "current week" compliance metric needs one canonical week boundary to count every member against — an unconstrained `weekStartDate` would let members' weeks drift out of alignment with that boundary. `weekEndDate` (already server-derived as +6 days) is now always the following Sunday.
- 2026-07-08 — Implemented the Reports module (`feat/api-reports-module`, branched from `dev` — first module to use the new two-branch workflow): create/findMine/findAll/findOne/update/submit, per `ARCHITECTURE.md §3` and `DATABASE.md §5`'s status/compliance semantics. Confirmed with the user that `weekEndDate` is always server-derived from `weekStartDate` (+6 days), not client-supplied, so weeks stay aligned across the team for dashboard aggregation. Typecheck/lint/build clean; extensively smoke-tested against the Docker stack, including both branches of the DRAFT→SUBMITTED/LATE deadline logic with real dates.
- 2026-07-07 — Switched to a two-branch workflow: `main` (production-ready, only updated via `dev` promotion) + `dev` (integration branch, branched from `main`). All topic branches now branch from `dev` and PR into `dev` (squash-merge); `dev` → `main` is promoted periodically via PR with a regular merge commit (not squash), once a stable slice of work is verified. Updated `AGENTS/GIT_WORKFLOW.md` and `CLAUDE.md` accordingly. Created `dev` from `main` at `7626836` (tip after the projects-module merge).
- 2026-07-07 — Read all `AGENTS/*.md` docs. Confirmed existing scaffold: Prisma schema, seed script, common guards/decorators/filters/interceptors, and `shared-types` enums/interfaces are already implemented. Feature modules are empty stubs. Starting Phase 1 with the Auth module (`feat/api-auth-module`), since every other module depends on its guards/decorators.
- 2026-07-07 — Implemented the Projects module core (`feat/api-projects-module`, branched from `feat/api-users-module`): list/create/update/soft-delete, list open to any authenticated user, writes Manager-only. Deferred the optional member-assignment endpoints. Typecheck/lint/build clean; smoke-tested against the Docker stack including soft-delete filtering and unique-name conflicts.
- 2026-07-07 — Implemented the Users module (`feat/api-users-module`, branched from `feat/api-auth-module`): list/get/patch, all Manager-only. Refactored the user-safe-mapping logic out of `AuthService` into `common/mappers` to avoid duplicating it. Verified RolesGuard's 403 path for the first time. Typecheck/lint/build clean; smoke-tested against the Docker stack.
- 2026-07-07 — Implemented the Auth module fully (JwtStrategy, JwtAuthGuard, AuthService, AuthController, DTOs) and wired it end-to-end. Typecheck, lint, and `nest build` all pass. While rebuilding the Docker image to smoke-test, found and fixed a real bug introduced by the earlier husky fix: `apps/api/Dockerfile`'s `deps` stage used `--ignore-scripts`, which also skipped `bcrypt`'s native-binding build script — the `runner` image (which copies `node_modules` from `deps`) then crashed at boot with `MODULE_NOT_FOUND` for `bcrypt_lib.node` as soon as `AuthService` (the first real consumer of `bcrypt`) was added. Fixed by narrowing the fix to `npm pkg delete scripts.prepare && npm ci --omit=dev` (drops only the broken husky hook, leaves bcrypt's own install script intact). Verified against the running Compose stack: register/login/me/logout all behave correctly, RBAC field-stripping on register confirmed, cookie flags confirmed.
