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

### 1.3 Projects Module — CORE DONE (`feat/api-projects-module`); member assignment deferred

- [x] `CreateProjectDto` / `UpdateProjectDto`
- [x] `ProjectsService` (CRUD + soft-delete via `is_active`, unique-name conflict check on create/rename)
- [x] `ProjectsController` — `GET /projects` (any authenticated user), `POST` / `PATCH /:id` / `DELETE /:id` (Manager-only)
- [x] `toProjectDto` mapper added alongside `toSafeUser` in `common/mappers`
- [x] Smoke-tested: unauthenticated 401, team member can list but not write (403), manager full CRUD, duplicate-name 409, soft-delete removes from the active list (`GET /projects` only returns `isActive: true`), 404 on missing id, `forbidNonWhitelisted` rejects a client-supplied `isActive`
- [ ] **Deferred:** `POST/DELETE /projects/:id/members` (optional per `ARCHITECTURE.md`/`PROJECT_IDEA.md` §4.4 — "optional feature"). `UserProject` model already exists in the Prisma schema; not yet exposed via API. Revisit after Reports/Dashboard if time allows.

### 1.4 Reports Module

- [ ] `CreateReportDto` / `UpdateReportDto` (fixed fields only, per `DATABASE.md`)
- [ ] `ReportsService` — create (DRAFT), update (DRAFT only, ownership via JWT `userId`), submit (DRAFT→SUBMITTED/LATE via deadline comparison), findMine, findOne (owner or manager), findAll (manager, with filters: member/project/date range)
- [ ] `ReportsController` — wire endpoints from `ARCHITECTURE.md §3`
- [ ] Enforce `UNIQUE(user_id, week_start_date)` conflict → clean 409/400 response

### 1.5 Dashboard Module

- [ ] `DashboardService` — summary (total/compliance/open blockers per `DATABASE.md §5` formula), trend, status-by-member, workload-by-project, activity feed
- [ ] `DashboardController` — all Manager-only

### 1.6 Cross-cutting

- [ ] Confirm `ValidationPipe`, `AllExceptionsFilter`, `TransformResponseInterceptor` apply cleanly end-to-end once real endpoints exist
- [ ] `.env.example` kept in sync with any new env vars
- [ ] Manual smoke test of each endpoint (curl/Postman) before moving to frontend phase

## Phase 2 — Frontend (Next.js)

- [ ] Not started — deferred until Phase 1 is functionally complete

## Phase 3 — AI Chat Assistant (Bonus)

- [ ] Not started — deferred until Phase 2 is functionally complete

## Open Questions

- **Last-manager demotion:** `PATCH /users/:id` currently lets a Manager demote any user, including themself or the last remaining `MANAGER`, with no floor check. Spec is silent on this. Left as-is (no invented guard) — flag if this should be blocked before Manager routes proliferate further.

## Log

- 2026-07-07 — Read all `AGENTS/*.md` docs. Confirmed existing scaffold: Prisma schema, seed script, common guards/decorators/filters/interceptors, and `shared-types` enums/interfaces are already implemented. Feature modules are empty stubs. Starting Phase 1 with the Auth module (`feat/api-auth-module`), since every other module depends on its guards/decorators.
- 2026-07-07 — Implemented the Projects module core (`feat/api-projects-module`, branched from `feat/api-users-module`): list/create/update/soft-delete, list open to any authenticated user, writes Manager-only. Deferred the optional member-assignment endpoints. Typecheck/lint/build clean; smoke-tested against the Docker stack including soft-delete filtering and unique-name conflicts.
- 2026-07-07 — Implemented the Users module (`feat/api-users-module`, branched from `feat/api-auth-module`): list/get/patch, all Manager-only. Refactored the user-safe-mapping logic out of `AuthService` into `common/mappers` to avoid duplicating it. Verified RolesGuard's 403 path for the first time. Typecheck/lint/build clean; smoke-tested against the Docker stack.
- 2026-07-07 — Implemented the Auth module fully (JwtStrategy, JwtAuthGuard, AuthService, AuthController, DTOs) and wired it end-to-end. Typecheck, lint, and `nest build` all pass. While rebuilding the Docker image to smoke-test, found and fixed a real bug introduced by the earlier husky fix: `apps/api/Dockerfile`'s `deps` stage used `--ignore-scripts`, which also skipped `bcrypt`'s native-binding build script — the `runner` image (which copies `node_modules` from `deps`) then crashed at boot with `MODULE_NOT_FOUND` for `bcrypt_lib.node` as soon as `AuthService` (the first real consumer of `bcrypt`) was added. Fixed by narrowing the fix to `npm pkg delete scripts.prepare && npm ci --omit=dev` (drops only the broken husky hook, leaves bcrypt's own install script intact). Verified against the running Compose stack: register/login/me/logout all behave correctly, RBAC field-stripping on register confirmed, cookie flags confirmed.
