# AI Agent Rules and Guidelines

Welcome, AI Agent. When working on this project (**Sisenco Digital Internship — Weekly Report Generator & Team Dashboard**), you MUST strictly adhere to the following rules without exception.

---

## 0. Mandatory Pre-Work (DO THIS FIRST)
Before writing a single line of code, you MUST read **every** file in the `AGENTS/` directory in this exact order:

1. `AGENTS/technical_assignment.md` — Source of truth for all requirements.
2. `AGENTS/PROJECT_IDEA.md` — Big picture, user journeys, feature list.
3. `AGENTS/ARCHITECTURE.md` — System architecture, API design, folder structure.
4. `AGENTS/DATABASE.md` — Full database schema, ER diagram, constraints.
5. `AGENTS/SECURITY_GUIDELINES.md` — Authentication, authorization, validation rules.
6. `AGENTS/CODING_STANDARDS.md` — Code style, naming, SOLID, patterns.
7. `AGENTS/GIT_WORKFLOW.md` — Branching model, commit rules, PR & repository management.
8. `AGENTS/UI_UX_DESIGN.md` — Color palette, component design, layout rules.
9. `README.md` (root) — Setup & run instructions (created as a project deliverable).

**Do not begin implementing any feature until all 9 documents have been fully read.**

---

## 1. Ask Questions — Repeatedly and Without Shame
*   **Never assume.** If a requirement is ambiguous, incomplete, or conflicts with another document — STOP and ask the user to clarify before proceeding.
*   **Ask again if still unsure.** It is far better to ask three times and be correct than to write code that needs to be torn out.
*   **Confirm before large changes.** Before performing any refactor, database migration, or structural change, describe what you are about to do and explicitly ask for approval.
*   **Ask about edge cases.** For example: "What should happen if a Team Member tries to submit a report after the deadline?" Do not invent answers.
*   **State your assumptions.** When you must proceed with an assumption, state it explicitly so the user can correct you.

---

## 2. Follow Industry Standards & Best Practices
*   **Production mindset:** Treat every feature as if it will be deployed to a high-traffic, production environment from day one.
*   **Security first:** Always implement proper validation, sanitization, and authorization. Never expose sensitive data or credentials. See `SECURITY_GUIDELINES.md` for specifics.
*   **No shortcuts:** Do not use `// TODO`, placeholder logic, hardcoded values, or mock data as a substitute for real implementation unless explicitly asked.

---

## 3. Architecture & Technology Discipline
*   **Adhere to the chosen stack:** NestJS (backend), Next.js (frontend), PostgreSQL + Prisma (database), TanStack Query (data fetching), Recharts (charts). Do not introduce new libraries or frameworks without explicit user approval.
*   **Monorepo discipline:** All shared types and interfaces MUST live in the `packages/shared-types` package and be imported from there in both `apps/api` and `apps/web`. Never duplicate types.
*   **Typing:** Zero `any` types in TypeScript. Use the shared types. Enable `strict: true` in all `tsconfig.json` files.

---

## 4. Code Quality & Maintainability
*   **Write clean, modular code.** Small, focused functions. One responsibility per class/component.
*   **Follow all naming conventions** detailed in `CODING_STANDARDS.md`.
*   **No dead code.** No unused imports, unused variables, or commented-out blocks.
*   **Document complex logic.** Add JSDoc comments to all public service methods and complex utility functions.

---

## 5. Strict Requirement Adherence
*   The report form fields are **fixed and non-customizable by end users**: `week/date range`, `project tag`, `tasks completed`, `tasks planned`, `blockers`, `hours worked (optional)`, `optional notes/links`. Do not add or remove fields.
*   The `Manager` role sees all reports. The `Team Member` role sees only their own. This boundary must be enforced at **both** the API level (NestJS Guard) and the frontend (Next.js Middleware).
*   Follow the 3 Execution Phases in strict order: **Backend → Frontend → AI Integration.**

---

## 6. Git & Commit Discipline
*   **`AGENTS/GIT_WORKFLOW.md` is the authority** for branching, commits, PRs, and repository management. Read it before touching source control.
*   Commit frequently with small, atomic commits.
*   Use conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
*   Example: `feat(reports): implement DRAFT to SUBMITTED status transition`
*   No direct commits to `main` — work on a `<type>/<summary>` branch and land via PR (squash-merge).
