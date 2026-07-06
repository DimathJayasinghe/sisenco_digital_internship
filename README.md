# sisenco_digital_internship

# Weekly Report Generator & Team Dashboard — Project README

## Overview
A full-stack Monorepo application enabling team members to submit structured weekly reports and managers to analyze them through a unified dashboard. See `AGENTS/Project_idea.md` for the full big-picture spec.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, TailwindCSS, Recharts, TanStack Query v5 |
| Backend | NestJS (Node.js, TypeScript) |
| Database | Neon (Serverless PostgreSQL) + Prisma ORM |
| Architecture | Monorepo (Turborepo) |
| AI (Bonus) | Anthropic Claude / OpenAI |

---

## Agent Documentation
All AI agents working on this project MUST read the `AGENTS/` directory in full before writing any code. Files are ordered by priority:

| File | Purpose |
|---|---|
| `AGENTS/technical_assignment.md` | Source of truth — original assignment requirements |
| `AGENTS/Project_idea.md` | Big picture, user journeys, feature list |
| `AGENTS/ARCHITECTURE.md` | System architecture, folder structure, all API endpoints |
| `AGENTS/database.md` | Full DB schema, ER diagram, constraints, Prisma notes |
| `AGENTS/SECURITY_GUIDELINES.md` | Auth, authorization, validation, secrets |
| `AGENTS/CODING_STANDARDS.md` | Code style, patterns, naming, Git conventions |
| `AGENTS/UI_UX_DESIGN.md` | Colors, typography, component specs, layouts |
| `AGENTS/AGENT_RULES.md` | Rules all agents must follow at all times |

---

## Execution Phases

### Phase 1: Backend Setup (NestJS)
1. Initialize NestJS app in `apps/api/`. Set up Turborepo.
2. Connect Prisma to PostgreSQL. Apply initial migration from `AGENTS/database.md` schema.
3. Seed database with `MANAGER` and `TEAM_MEMBER` roles.
4. Implement `AuthModule` — registration, login, JWT + refresh token in HttpOnly cookies.
5. Implement `UsersModule`, `ProjectsModule`, `ReportsModule` with full REST CRUD.
6. Implement `DashboardModule` — aggregation queries for metrics and chart data.
7. Implement `RolesGuard` and `JwtAuthGuard`. Apply to all protected routes.
8. Implement `AiModule` (Bonus) — context injection + LLM call endpoint.

### Phase 2: Frontend Setup (Next.js)
1. Initialize Next.js app in `apps/web/`. Set up Turborepo pipeline.
2. Configure TailwindCSS with color tokens from `UI_UX_DESIGN.md`.
3. Implement `middleware.ts` for route protection and role-based redirects.
4. Build shared UI primitives in `components/ui/` (Button, Input, Card, Badge, Modal).
5. Build **Team Member pages**: Personal Report Page + Report History.
6. Build **Manager pages**: Team Dashboard with metric cards, charts, and data table.
7. Integrate TanStack Query for all data fetching.
8. Integrate Recharts charts on the Manager Dashboard.
9. Implement AI Chat Widget (Bonus) on the Manager Dashboard.

### Phase 3: Polish & Deliverables
1. Full responsive testing across mobile, tablet, desktop.
2. Write comprehensive `README.md` setup instructions (this file — see below).
3. Export ER Diagram from `AGENTS/database.md` via dbdiagram.io.
4. Prepare Google Slides presentation.
5. Record video demo walkthrough.

---

## Setup Instructions

### Prerequisites
*   Node.js 20+
*   A [Neon](https://neon.tech) account (free tier is sufficient — no local database installation needed)
*   `pnpm` (recommended) or `npm`

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
```bash
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL (your Neon connection string), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL, etc.

cp apps/web/.env.example apps/web/.env.local
# Fill in NEXT_PUBLIC_API_URL
```

> **Getting your Neon DATABASE_URL:**
> 1. Go to [neon.tech](https://neon.tech) and create a free account.
> 2. Create a new project (e.g., `sisenco-reports`).
> 3. Copy the **connection string** from the Neon dashboard.
> 4. Paste it as the value of `DATABASE_URL` in `apps/api/.env`.
> 5. Neon connection strings look like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
>
> **Important:** The `?sslmode=require` parameter at the end of the Neon connection string is mandatory. Do not remove it.

### 3. Run Database Migration & Seed
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Backend (NestJS)
```bash
# From repo root (Turborepo)
pnpm run dev --filter=api
# Runs at http://localhost:4000
```

### 5. Run Frontend (Next.js)
```bash
# From repo root (Turborepo)
pnpm run dev --filter=web
# Runs at http://localhost:3000
```

### 6. Run Both Simultaneously (Recommended)
```bash
# From repo root
pnpm run dev
```

---

## Deliverables Checklist
- [ ] **GitHub Repository** — This repo, public, with clean commit history.
- [ ] **ER Diagram** — Hosted on dbdiagram.io (link in presentation).
- [ ] **Google Slides Presentation** — Architecture, DB design, API design, challenges, AI approach.
- [ ] **Video Demo** — Google Drive link, walkthrough as Team Member and Manager.