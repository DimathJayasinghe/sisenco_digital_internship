# Backend end-to-end smoke test

`backend-smoke-test.sh` is a black-box HTTP test suite for `apps/api`. It
exercises every implemented module — auth, users, projects (including member
assignment), reports, and dashboard — as a real client would: over HTTP,
against a running instance, asserting on status codes and response bodies.

## Running it

```bash
# from the repo root
docker compose up -d          # or: docker compose up -d --build, if you changed api code
./e2e/backend-smoke-test.sh
```

Exits `0` with `ALL CHECKS PASSED` if every assertion passed, or `1` with a
`FAILED CHECKS` summary listing exactly what didn't.

### Env overrides

| Variable                | Default                        |
| ----------------------- | ------------------------------ |
| `API_BASE_URL`          | `http://localhost:3001/api/v1` |
| `SEED_MANAGER_EMAIL`    | `manager@sisenco.local`        |
| `SEED_MANAGER_PASSWORD` | `ChangeMe123!`                 |

## Design notes

- **Safe to re-run against a dirty/shared database.** Every user and project
  the script creates is namespaced with a unique `RUN_ID` (a UTC timestamp),
  so repeated runs never collide with each other or with whatever else is
  already in the database. Nothing is torn down afterward — each run leaves
  its fixtures behind, which is intentional (there's no `DELETE /users`
  endpoint to clean up with anyway, and leftover fixture data is harmless).
- **Dashboard assertions are delta-based, not absolute.** The script reads
  `GET /dashboard/summary` before and after registering its own fixture
  users, and asserts the _difference_ matches what it just did (e.g.
  `expectedMembers` went up by exactly 2). This makes the suite correct
  regardless of how much unrelated data already exists — no dependency on a
  freshly-seeded database.
- **Rate limiting is real and shared across runs.** `/auth/login` and
  `/auth/register` are throttled to 10 requests/60s per
  `SECURITY_GUIDELINES.md §4`. A single run uses roughly 8 logins + 6
  registers — comfortably under the limit on its own, but running the script
  **twice in quick succession** can trip the throttle, since the window is
  shared. If you see `429 ThrottlerException` failures (usually cascading
  into a run of unrelated-looking `401`s once a session cookie never got
  issued), that's the rate limiter doing its job, not an application bug —
  wait about a minute between runs. This was confirmed by hand: an
  immediate re-run failed with exactly this pattern; the same run one
  minute later passed all 113 checks.
- **No new dependencies.** Just `bash`, `curl`, and `python3` (used only for
  JSON parsing) — everything already required to develop this repo.
