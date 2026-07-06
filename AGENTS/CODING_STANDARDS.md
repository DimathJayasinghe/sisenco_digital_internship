# Coding Standards & Best Practices

To maintain high code quality and long-term maintainability, all AI agents and developers must strictly follow these standards. Deviations require explicit user approval.

---

## 1. General Principles

*   **DRY (Don't Repeat Yourself):** Abstract repetitive logic into reusable functions, custom React hooks, or NestJS services.
*   **Single Responsibility Principle (SRP):** Every function, component, service, or class has exactly one reason to change.
*   **KISS:** Favor simple, readable solutions over clever ones.
*   **No Magic Numbers/Strings:** Extract all literals into named constants.

---

## 2. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Variables & functions | `camelCase` | `getUserById`, `weekStartDate` |
| Classes, Interfaces, Types | `PascalCase` | `CreateReportDto`, `ReportService` |
| Enums | `PascalCase` (name), `UPPER_SNAKE_CASE` (values) | `ReportStatus.SUBMITTED` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_HOURS_PER_WEEK` |
| Backend files/dirs | `kebab-case` | `reports.service.ts`, `create-report.dto.ts` |
| Frontend component files | `PascalCase` | `ReportCard.tsx`, `DashboardMetricBadge.tsx` |
| Frontend hook files | `camelCase` with `use` prefix | `useReports.ts`, `useAuth.ts` |
| Database columns | `snake_case` (via Prisma `@map`) | `week_start_date`, `password_hash` |
| Git branches | `kebab-case` with type prefix | `feat/report-submission`, `fix/auth-cookie` |

---

## 3. TypeScript Standards

*   `strict: true` must be set in all `tsconfig.json` files.
*   **Zero `any` types.** Use `unknown` and type-narrow if needed.
*   All shared interfaces and enums live in `packages/shared-types/src/` and are imported from there in both `apps/api` and `apps/web`. Never duplicate type definitions.
*   Use `readonly` on DTO properties where mutation is not intended.
*   Prefer `interface` over `type` for object shapes; use `type` for unions/intersections.

---

## 4. Backend (NestJS) Standards

### Module Structure
Every feature (Auth, Users, Reports, Projects, Dashboard, AI) must be its own NestJS module. No cross-module direct service injection — use proper NestJS DI exports.

### Separation of Concerns
| Layer | Responsibility | What it MUST NOT do |
|---|---|---|
| **Controller** | Parse request, call service, return response | Contain business logic or DB calls |
| **Service** | All business logic | Directly use Prisma client |
| **Prisma Service / Repository** | All database queries | Contain business logic |
| **Guard** | Auth & role checks | Anything else |
| **Interceptor** | Transform responses, logging | Business logic |
| **Filter** | Handle and format exceptions | Business logic |

### DTOs
*   Every POST/PATCH/PUT endpoint has a dedicated `CreateXDto` and `UpdateXDto`.
*   Use `class-validator` decorators on every field.
*   Enable the global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.

### Error Handling
*   Use NestJS built-in HTTP exception classes: `NotFoundException`, `ForbiddenException`, `BadRequestException`, etc.
*   Never return a raw `500` error to the client — always use an `ExceptionFilter` to format errors per the standard response format in `ARCHITECTURE.md`.

---

## 5. Frontend (Next.js & React) Standards

### Component Design
*   Components should be small, focused, and primarily stateless (receive data via props).
*   Break complex pages into nested components: Page → Section → Component → Primitive UI.
*   Primitives (Button, Input, Badge, Card, Modal) live in `components/ui/`. These must be maximally reusable and must accept standard HTML attributes via prop spreading.

### State Management
*   **Server state** (data from the API): Always use TanStack Query (React Query). No `useEffect` + `fetch` for data fetching.
*   **Local UI state** (modals open/close, form inputs): `useState`.
*   **Global app state** (auth user, theme): React Context + `useReducer`. Keep contexts minimal — don't put server data in a context.

### Styling
*   TailwindCSS only. No inline styles. No CSS modules unless for a very specific edge case.
*   Use `clsx` + `tailwind-merge` (`cn()` utility) for conditional class names to avoid conflicts.
*   All spacing, typography, and colors must follow the tokens defined in `UI_UX_DESIGN.md`.

---

## 6. Design Patterns

*   **Repository Pattern (Backend):** The database access layer is isolated in the Service layer via Prisma. Business logic never touches Prisma directly.
*   **Custom Hook Pattern (Frontend):** Extract all API-related TanStack Query calls into domain-specific hooks (e.g., `useReports()`, `useProjects()`). Pages import hooks, not raw query functions.
*   **Adapter/Transformer Pattern:** API responses are transformed into frontend-safe shapes in a dedicated `lib/adapters/` layer, not inside components.

---

## 7. Git & Commit Standards

*   Commit frequently with small, atomic, focused commits.
*   Use **Conventional Commits** format strictly:

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change that neither adds feature nor fixes bug |
| `chore:` | Tooling, config, dependency updates |
| `docs:` | Documentation only |
| `test:` | Adding or fixing tests |
| `style:` | Formatting only (no logic change) |

*   Example: `feat(reports): add DRAFT to SUBMITTED status transition endpoint`
*   Never commit `.env` files. Never commit `node_modules`.

---

## 8. Tooling
*   **ESLint:** Enforced via the shared Turborepo config. Zero lint warnings allowed.
*   **Prettier:** All code must be formatted. Run before committing.
*   **Husky + lint-staged:** Configure to auto-run lint and format on pre-commit.
