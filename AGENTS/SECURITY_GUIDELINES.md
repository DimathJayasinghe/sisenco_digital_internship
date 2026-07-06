# Security Guidelines

Security is a first-class concern across the entire stack. All agents must follow these practices strictly. There are no acceptable exceptions without explicit user approval.

---

## 1. Authentication & Session Management

### JWT Storage
*   Tokens **MUST** be stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies — enforced by NestJS on the `Set-Cookie` header.
*   **Never** store JWTs in `localStorage`, `sessionStorage`, or any JavaScript-accessible storage. This is a hard rule — XSS vulnerabilities can steal those tokens.

### Token Lifecycle
*   **Access Token:** Short-lived (e.g., 15 minutes).
*   **Refresh Token:** Longer-lived (e.g., 7 days), also stored in an `HttpOnly` cookie.
*   **Refresh Token Rotation:** Every time a refresh token is used to issue a new access token, the old refresh token is invalidated and a new one is issued. This prevents token replay attacks.
*   Store a hash of the refresh token in the database (a `refresh_token_hash` column on `users`) to enable server-side invalidation on logout.

### Password Security
*   Hash passwords using `bcrypt` (minimum 12 rounds) or `argon2id`.
*   Never store, log, or return plain-text passwords anywhere.
*   On login failure, return a generic message (`"Invalid email or password"`) — never indicate which field was wrong (prevents user enumeration).

---

## 2. Authorization & Role-Based Access Control (RBAC)

### Backend (NestJS)
*   Every protected route must have `@UseGuards(JwtAuthGuard)`.
*   Manager-only routes additionally require `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('MANAGER')`.
*   The role is read from the **validated JWT payload** — never from the request body or query parameter.

### Data Ownership Enforcement
*   For Team Member report endpoints (`GET /reports/my`, `PATCH /reports/:id`), the service layer **must** filter by `userId` extracted from the JWT, not from the request. Example:
    ```typescript
    // ✅ CORRECT — user_id from JWT payload
    findReport(reportId: string, requestingUserId: string) {
      return this.prisma.report.findFirst({
        where: { id: reportId, userId: requestingUserId }
      });
    }
    ```
*   Never trust the client to provide their own `userId` in a request body or query param for ownership-sensitive operations.

### Frontend (Next.js)
*   `middleware.ts` must run on all routes under `/(member)/*` and `/(manager)/*`.
*   Redirect to `/login` if no auth cookie is present.
*   Redirect `TEAM_MEMBER` users to `/unauthorized` if they attempt to access `/(manager)/*` routes.

---

## 3. Data Validation & Sanitization

*   The global NestJS `ValidationPipe` MUST be configured with:
    ```typescript
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,           // Auto-transform payloads to DTO class instances
    }));
    ```
*   Every DTO property is annotated with `class-validator` decorators (`@IsString()`, `@IsDateString()`, `@IsOptional()`, etc.).
*   **SQL Injection:** Prisma's parameterized queries prevent SQL injection inherently. Never concatenate user input into raw SQL strings. If `prisma.$queryRaw` must be used, use tagged template literals only (Prisma's built-in safe interpolation).

---

## 4. API Security Headers & Hardening

*   **Helmet:** Install and enable `helmet` in `main.ts`. This sets secure HTTP headers: `X-Content-Type-Options`, `X-Frame-Options` (anti-Clickjacking), `Strict-Transport-Security`, `Content-Security-Policy`, etc.
    ```typescript
    import helmet from 'helmet';
    app.use(helmet());
    ```
*   **CORS:** Configure strictly. Only allow the trusted frontend origin (from environment variable). Do not use `origin: '*'`.
    ```typescript
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true, // Required for cookies
    });
    ```
*   **CSRF Protection:** Since the app uses `SameSite=Strict` cookies, CSRF risk is substantially mitigated. Additionally, validate the `Origin` or `Referer` header on state-changing requests (POST/PATCH/DELETE).
*   **Rate Limiting:** Install `@nestjs/throttler`. Apply globally:
    *   Default: 100 requests per 60 seconds.
    *   Strict: 10 requests per 60 seconds on `/auth/login` and `/auth/register` to prevent brute-force attacks.

---

## 5. Environment Variables & Secrets

*   **Never hardcode secrets** (DB URLs, JWT secrets, LLM API keys) in source code.
*   All secrets must be in `.env` files, loaded via NestJS `ConfigModule` (`@nestjs/config`).
*   `.env`, `.env.local`, `.env.production` are all **gitignored**. Provide a `.env.example` with placeholder values for setup.
*   Required environment variables:
    ```
    DATABASE_URL=
    JWT_ACCESS_SECRET=
    JWT_REFRESH_SECRET=
    JWT_ACCESS_EXPIRES_IN=15m
    JWT_REFRESH_EXPIRES_IN=7d
    FRONTEND_URL=http://localhost:3000
    OPENAI_API_KEY=           # or ANTHROPIC_API_KEY (Bonus)
    ```

---

## 6. Response Security & Data Leakage Prevention

*   **Never return `password_hash`** or `refresh_token_hash` in any API response. Use Prisma `select` to explicitly exclude sensitive fields, or use a global `ClassSerializerInterceptor` with `@Exclude()` decorators on the User entity.
*   **Error messages must not leak internal details** (stack traces, DB error messages, file paths) to the client. Use an `AllExceptionsFilter` to sanitize error responses in production.
*   Validate that `project_id` values in report creation requests are real, active projects.
