# Project Specs: Weekly Report Generator & Team Dashboard

## 1. Overview (The Big Picture)
A full-stack web application that solves the problem of scattered, unstructured weekly updates. It forces a **fixed, standardized report format** for team members and gives managers a **unified, data-driven dashboard** to analyze performance, track compliance, and identify blockers. Built as a Monorepo with a NestJS backend and a Next.js frontend, sharing strict TypeScript types end-to-end.

---

## 2. Technical Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js 14+ (App Router), TailwindCSS, Recharts |
| Backend | NestJS (Node.js, TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Data Fetching | TanStack Query v5 |
| Architecture | Monorepo (Turborepo) |
| AI (Bonus) | Anthropic Claude |

---

## 3. User Journeys (System Workflow)

### Team Member Journey
1. Registers or is assigned an account with the `TEAM_MEMBER` role.
2. Logs in → Lands on their **Personal Report Page**.
3. Creates a new weekly report by selecting a project tag and filling the **fixed fields** (no customization allowed).
4. Saves as **DRAFT**, reviews, then formally **SUBMITS**.
5. Can view their full **report history**, organized by week.
6. Cannot access any Manager or other member's data.

### Manager Journey
1. Logs in → Lands on the **Team Dashboard**.
2. Sees an instant visual overview: compliance rate, open blockers, total submitted reports.
3. Filters reports by **team member**, **project**, or **date range**.
4. Reads individual reports to identify blockers.
5. Uses the **AI Chat Assistant** to ask natural language questions (e.g., *"What were the common blockers last week?"*).
6. Manages **Projects/Categories** — adding, editing, or archiving them.

---

## 4. Core Features & Requirements

### 4.1 Authentication & Roles
*   **Roles:** `TEAM_MEMBER` and `MANAGER`.
*   **Features:** User registration, login/logout, secure session (HttpOnly JWT cookie), role-based route protection.
*   New signups **always** start as `TEAM_MEMBER`; a Manager promotes users to `MANAGER` via the Users endpoint. No role selection at signup — this prevents privilege escalation.

### 4.2 Personal Weekly Report Page (Team Member)
*   **Fixed Fields (no user customization):**
    1.  Week / date range
    2.  Project or category tag
    3.  Tasks completed
    4.  Tasks planned for next week
    5.  Blockers / challenges
    6.  Hours worked *(optional)*
    7.  Notes or links *(optional)*
*   **Actions:** Create, Edit (DRAFT only), Submit, View history.
*   A user **cannot** see or edit another member's reports.

### 4.3 Team Dashboard (Manager View)
*   View all team members' reports for a selected week.
*   **Filters:** by team member, by project/category, by date range.
*   Track **submission status** per member for the week: `SUBMITTED`, `LATE`, or `PENDING` (no submitted report yet — a lingering `DRAFT` still counts as pending). Exact compliance semantics live in `DATABASE.md §5`.

### 4.4 Projects & Categories
*   Managers can: Add, Edit, Delete (soft-delete via `is_active`) projects.
*   Projects act as mandatory tags on every report entry.
*   Examples: *Client A, Internal Tooling, R&D, Marketing*.

### 4.5 Dashboard & Visual Insights

**Summary Metric Cards:**
*   Total reports submitted this week
*   Submission compliance rate (submitted / total expected)
*   Number of open blockers across the team

**Charts (using Recharts):**
*   Tasks completed trend over time (per person or team-wide)
*   Report submission status by team member (submitted / pending / late)
*   Workload / task distribution by project
*   Recent reports / activity feed

### 4.6 AI Chat Assistant (Bonus — Good to Have)
*   In-app chat widget on the Manager Dashboard.
*   Manager asks natural language questions about team activity.
*   Backend fetches relevant report context from PostgreSQL, constructs an LLM prompt, and returns the answer.
*   Must document: prompt design, LLM provider, data-privacy considerations.

---

## 5. Deliverables Checklist
- [ ] **GitHub Repository** — Monorepo with full setup README.
- [ ] **ER Diagram** — Via dbdiagram.io or equivalent.
- [ ] **Google Slides Presentation** — Architecture, DB design, API design, challenges, AI approach (if implemented).
- [ ] **Video Demo** (Google Drive link) — Walkthrough as both Team Member and Manager.