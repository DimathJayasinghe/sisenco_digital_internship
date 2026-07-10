# System Architecture

This document outlines the definitive architectural decisions for the Weekly Report Generator & Team Dashboard. All agents must follow this architecture without deviation.

---

## 1. Tech Stack

| Layer              | Technology                      | Notes                                           |
| ------------------ | ------------------------------- | ----------------------------------------------- |
| Monorepo           | Turborepo                       | Shares types, configs, utilities                |
| Frontend           | Next.js 14+ (App Router)        | React, TypeScript                               |
| Styling            | TailwindCSS                     | Utility-first, see `UI_UX_DESIGN.md`            |
| Data Fetching      | TanStack Query v5               | All server state on frontend                    |
| Data Visualization | Recharts                        | Manager dashboard charts                        |
| Backend            | NestJS (Node.js)                | Modular, TypeScript                             |
| Auth Library       | Passport.js                     | JWT strategy                                    |
| Database           | Neon (Serverless PostgreSQL)    | Cloud-hosted, free tier, no local DB needed     |
| ORM                | Prisma                          | Type-safe queries, migrations                   |
| AI Module          | Google Gemini (`@google/genai`) | Bonus feature — implemented, `gemini-3.5-flash` |

---

## 2. Monorepo Folder Structure

```
/
├── apps/
│   ├── api/                    # NestJS backend application
│   │   └── src/
│   │       ├── auth/           # AuthModule (login, register, JWT)
│   │       ├── users/          # UsersModule (CRUD, profile)
│   │       ├── reports/        # ReportsModule (CRUD, status transitions)
│   │       ├── projects/       # ProjectsModule (CRUD)
│   │       ├── dashboard/      # DashboardModule (aggregation queries)
│   │       ├── ai/             # AiModule (bonus — LLM integration)
│   │       ├── common/         # Shared guards, decorators, interceptors, filters
│   │       └── main.ts
│   └── web/                    # Next.js frontend application
│       └── src/
│           ├── app/            # Next.js App Router pages
│           │   ├── (auth)/     # login, register pages (public)
│           │   ├── (member)/   # Team Member pages (protected)
│           │   │   ├── reports/
│           │   │   └── history/
│           │   └── (manager)/  # Manager pages (protected, role-gated)
│           │       ├── dashboard/
│           │       └── projects/
│           ├── components/     # Reusable UI components
│           │   ├── ui/         # Primitive components (Button, Input, Card...)
│           │   ├── reports/    # Report-specific components
│           │   ├── dashboard/  # Dashboard & chart components
│           │   └── layout/     # Navbar, Sidebar, PageWrapper
│           ├── hooks/          # Custom React hooks (useReports, useAuth...)
│           ├── lib/            # API client (axios instance), utils
│           └── middleware.ts   # Next.js route protection middleware
├── packages/
│   └── shared-types/           # Shared TypeScript interfaces & enums
│       └── src/
│           ├── user.types.ts
│           ├── report.types.ts
│           └── project.types.ts
├── package.json                # Root workspace config
└── turbo.json                  # Turborepo pipeline config
```

---

## 3. API Design & Request/Response Format

### Base URL

All API endpoints are prefixed: `/api/v1`

In development the API listens on `http://localhost:3001` and the Next.js app on `http://localhost:3000`. The browser reaches the API through a Next.js rewrite/proxy so requests stay same-origin and the auth cookie is always sent. Both hosts share the `localhost` site, so `SameSite=Strict` cookies are delivered across the two ports.

### Authentication Endpoints

| Method | Endpoint                       | Access        | Description                                                                                                              |
| ------ | ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/v1/auth/register`        | Public        | Register new user — **always assigned `TEAM_MEMBER`** (client-supplied role is ignored; see `SECURITY_GUIDELINES.md §2`) |
| POST   | `/api/v1/auth/login`           | Public        | Login, returns HttpOnly cookie                                                                                           |
| POST   | `/api/v1/auth/logout`          | Authenticated | Clears auth cookie                                                                                                       |
| GET    | `/api/v1/auth/me`              | Authenticated | Returns current user profile                                                                                             |
| PATCH  | `/api/v1/auth/change-password` | Authenticated | Change own password (requires current password, bcrypt-verified) — same throttle tier as login/register                  |

### Users Endpoints

| Method | Endpoint            | Access        | Description                                                                                         |
| ------ | ------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/api/v1/users`     | Manager       | List all users                                                                                      |
| GET    | `/api/v1/users/:id` | Manager       | Get specific user                                                                                   |
| PATCH  | `/api/v1/users/:id` | Manager       | Update user (e.g. assign role)                                                                      |
| PATCH  | `/api/v1/users/me`  | Authenticated | Update own name — no `role` field, self-promotion is impossible (`forbidNonWhitelisted` rejects it) |

### Reports Endpoints

| Method | Endpoint                     | Access             | Description                         |
| ------ | ---------------------------- | ------------------ | ----------------------------------- |
| POST   | `/api/v1/reports`            | Team Member        | Create a new DRAFT report           |
| GET    | `/api/v1/reports/my`         | Team Member        | Get own report history              |
| GET    | `/api/v1/reports/:id`        | Owner or Manager   | Get specific report                 |
| PATCH  | `/api/v1/reports/:id`        | Owner (DRAFT only) | Update a report                     |
| POST   | `/api/v1/reports/:id/submit` | Owner              | Change status DRAFT → SUBMITTED     |
| GET    | `/api/v1/reports`            | Manager            | Get all team reports (with filters) |

### Projects Endpoints

| Method | Endpoint                               | Access        | Description                                             |
| ------ | -------------------------------------- | ------------- | ------------------------------------------------------- |
| GET    | `/api/v1/projects`                     | Authenticated | List all active projects                                |
| POST   | `/api/v1/projects`                     | Manager       | Create project                                          |
| PATCH  | `/api/v1/projects/:id`                 | Manager       | Update project                                          |
| DELETE | `/api/v1/projects/:id`                 | Manager       | Soft-delete project (`is_active = false`)               |
| GET    | `/api/v1/projects/:id/members`         | Manager       | List members assigned to a project _(optional feature)_ |
| POST   | `/api/v1/projects/:id/members`         | Manager       | Assign a member to a project _(optional feature)_       |
| DELETE | `/api/v1/projects/:id/members/:userId` | Manager       | Unassign a member from a project _(optional feature)_   |

### Dashboard Endpoints

| Method | Endpoint                            | Access  | Description                                    |
| ------ | ----------------------------------- | ------- | ---------------------------------------------- |
| GET    | `/api/v1/dashboard/summary`         | Manager | Metrics: total, compliance rate, open blockers |
| GET    | `/api/v1/dashboard/charts/trend`    | Manager | Tasks completed trend over time                |
| GET    | `/api/v1/dashboard/charts/status`   | Manager | Submission status by member                    |
| GET    | `/api/v1/dashboard/charts/workload` | Manager | Workload by project                            |
| GET    | `/api/v1/dashboard/activity`        | Manager | Recent reports / activity feed                 |

### AI Endpoints (Bonus)

| Method | Endpoint          | Access  | Description                          |
| ------ | ----------------- | ------- | ------------------------------------ |
| POST   | `/api/v1/ai/chat` | Manager | Send a message, receive LLM response |

---

## 4. Standardized JSON Response Format

### Success Response

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

### Success — Paginated List Response

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["week_start_date must be a valid ISO 8601 date"]
}
```

---

## 5. Authentication & Authorization Flow

0.  **Register:** User POSTs credentials → NestJS creates the user with the **`TEAM_MEMBER`** role (any client-supplied role is ignored). Promotion to `MANAGER` happens only via `PATCH /users/:id` by an existing Manager.
1.  **Login:** User POSTs credentials → NestJS validates → Issues a single stateless **access token (JWT)** → Sets `HttpOnly; Secure; SameSite=Strict` cookie. This token _is_ the session; there is no refresh-token flow (see `SECURITY_GUIDELINES.md §1`).
2.  **Request Auth:** Each subsequent request automatically sends the cookie → NestJS `JwtAuthGuard` validates the token on every protected route.
3.  **Role Check:** `RolesGuard` reads the `role` from the validated JWT payload and checks against the `@Roles('MANAGER')` decorator on the controller method.
4.  **Frontend Guard:** Next.js `middleware.ts` reads the auth cookie → Redirects unauthenticated users to `/login` → Redirects `TEAM_MEMBER` users away from `/manager/*` routes.

---

## 6. AI Assistant Integration (Bonus Module) — Implemented

- A dedicated `AiModule` in NestJS (`apps/api/src/ai/`): `AiController` (`@Roles(MANAGER)`, `POST /ai/chat`), `AiService`, `ChatMessageDto`.
- When a Manager sends a chat message, the `AiService`:
  1.  Fetches submitted/late reports from PostgreSQL for the current week, falling back to the most recent week with any submitted/late activity if the current week is empty.
  2.  Formats them into a structured text context block (per member: project, hours, status, tasks completed/planned, blockers).
  3.  Calls the Gemini API (`@google/genai`, model `gemini-3.5-flash` — see `apps/api/src/ai/ai.constants.ts`) with the context block as a `systemInstruction` and the manager's message as `contents`.
  4.  Returns the response to the frontend as `{ reply: string }` (`ChatResponse` in `shared-types`) — not streamed; a plain request/response was chosen over SSE/streaming to keep both the NestJS and Next.js sides simpler for a bonus feature, at the cost of the manager waiting for the full reply rather than seeing it token-by-token.
- Throttled tighter than the global rate limit (20 req/60s — `AI_CHAT_THROTTLE` in `ai.controller.ts`) since every request costs a paid external API call.
- The chat widget (`components/ai/ChatWidget.tsx`) is rendered from `(manager)/layout.tsx` — available on every manager page, not just the dashboard route, so the assistant is reachable wherever a manager is working.
- **Privacy:** report content (tasks, blockers, hours, member/project names) is sent to Google's Gemini API as context on every chat request. No credentials, emails, or raw database IDs are included in the context block. This is documented here and should also be called out in the project presentation per the assignment brief.
