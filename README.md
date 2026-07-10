# Weekly Report Generator & Team Dashboard

A full-stack app where team members submit fixed-format weekly reports and managers analyze them on a consolidated, data-driven dashboard with role-based access.

Built as a **Turborepo monorepo**: NestJS API + Next.js web app sharing strict TypeScript types end-to-end.

| Layer      | Tech                                                           |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TailwindCSS, TanStack Query, Recharts |
| Backend    | NestJS, Passport (JWT), Prisma                                 |
| Database   | PostgreSQL (Neon serverless)                                   |
| AI (bonus) | Google Gemini                                                  |

> The authoritative product/architecture/security/DB specs live in [`AGENTS/`](./AGENTS). Start with `AGENTS/technical_assignment.md`.

> **Just want to run it?** Jump to [Run with Docker](#run-with-docker) — one command brings up the database, API, and web app.

---

## Repository layout

```
apps/
  api/            NestJS backend (REST API, /api/v1)
  web/            Next.js frontend (App Router)
packages/
  shared-types/   Shared TS interfaces & enums (imported by both apps)
```

---

## Prerequisites

> Prefer zero setup? Skip this section and [Run with Docker](#run-with-docker) instead — it provisions Postgres for you.

For running natively on your machine:

- **Node.js ≥ 20** and **npm ≥ 10**
- A **PostgreSQL** database. No local install needed — this project uses [Neon](https://neon.tech) (free serverless Postgres). Create a project and copy its connection string.

---

## 1. Install dependencies

From the repo root (installs all workspaces):

```bash
npm install
```

## 2. Configure environment

Copy the example env file for the API and fill in the values:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables (see `apps/api/.env.example`):

| Variable         | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`   | Neon Postgres connection string (must include `?sslmode=require`) |
| `JWT_SECRET`     | Secret for signing the auth JWT                                   |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                                         |
| `FRONTEND_URL`   | `http://localhost:3000` (for CORS)                                |
| `GEMINI_API_KEY` | Optional — enables the AI chat assistant                          |

## 3. Set up the database

Apply the schema and seed the roles + a bootstrap manager account:

```bash
cd apps/api
npx prisma migrate dev      # creates tables from prisma/schema.prisma
npx prisma db seed          # seeds MANAGER/TEAM_MEMBER roles + first manager
```

## 4. Run

**Everything at once** (from repo root, via Turborepo):

```bash
npm run dev
```

**Or individually:**

```bash
npm run dev --workspace apps/api    # API  → http://localhost:3001
npm run dev --workspace apps/web    # Web  → http://localhost:3000
```

The web app proxies API calls, so open **http://localhost:3000**.

---

## Run with Docker

The whole stack — a local PostgreSQL, the NestJS API, and the Next.js web app — runs in containers. This path needs **no Node install and no Neon account**; only Docker.

**Prerequisites:** Docker Engine + Compose v2 (`docker compose version`).

```bash
cp .env.docker.example .env      # then set JWT_SECRET (required)
docker compose up --build        # build images + start everything
```

Then open **http://localhost:3000**. Sign in with the seeded manager
(`manager@sisenco.local` / `ChangeMe123!` unless you changed them in `.env`).

What comes up:

| Service       | Description                                                          | Host port |
| ------------- | -------------------------------------------------------------------- | --------- |
| `postgres`    | PostgreSQL 16, data persisted in the `pgdata` volume                 | 5432      |
| `api-migrate` | One-shot: pushes the Prisma schema + seeds roles/manager, then exits | —         |
| `api`         | NestJS REST API (`/api/v1`)                                          | 3001      |
| `web`         | Next.js app (proxies `/api/*` → `api`)                               | 3000      |

Configuration lives in `.env` (copied from `.env.docker.example`). `JWT_SECRET`
is **required** — generate one with `openssl rand -base64 48`. The database
credentials, seeded manager, optional `GEMINI_API_KEY`, and host port mappings
are all set there.

Useful commands:

```bash
docker compose up -d --build     # start detached
docker compose logs -f api web   # follow app logs
docker compose down              # stop (keeps the DB volume)
docker compose down -v           # stop and wipe the database
docker compose up --build api    # rebuild just the API after code changes
```

> Images are production builds (`node dist/main` for the API, Next.js standalone
> for the web app). The schema is applied with `prisma db push` from the seeded
> `api-migrate` job — there are no migration files yet; add them with
> `npx prisma migrate dev` when the schema stabilizes.

---

## Common scripts (root)

| Command             | What it does              |
| ------------------- | ------------------------- |
| `npm run dev`       | Run API + web together    |
| `npm run build`     | Build all workspaces      |
| `npm run lint`      | Lint all workspaces       |
| `npm run typecheck` | Type-check all workspaces |
| `npm run test`      | Run tests                 |
| `npm run format`    | Prettier across the repo  |
