#!/usr/bin/env bash
# End-to-end backend smoke test — exercises every implemented API module
# (auth, users, projects incl. member assignment, reports, dashboard)
# against a running instance of apps/api, over HTTP, as a black box.
#
# Usage:
#   docker compose up -d                 # from the repo root
#   ./e2e/backend-smoke-test.sh
#
# Env overrides:
#   API_BASE_URL           default http://localhost:3001/api/v1
#   SEED_MANAGER_EMAIL      default manager@sisenco.local
#   SEED_MANAGER_PASSWORD   default ChangeMe123!
#
# Safe to re-run: every user/project this script creates is namespaced with
# a unique RUN_ID, so repeated runs never collide with each other or with
# pre-existing data. Dashboard assertions are delta-based (before/after)
# rather than absolute, so they hold regardless of what else is in the DB.
#
# Exit code 0 = every check passed. Non-zero = at least one check failed
# (see the FAILED CHECKS summary printed at the end).

set -uo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3001/api/v1}"
SEED_MANAGER_EMAIL="${SEED_MANAGER_EMAIL:-manager@sisenco.local}"
SEED_MANAGER_PASSWORD="${SEED_MANAGER_PASSWORD:-ChangeMe123!}"

RUN_ID="$(date -u +%Y%m%d%H%M%S)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

PASS_COUNT=0
FAIL_COUNT=0
FAILED_CHECKS=()

# ── output helpers ──────────────────────────────────────────────────────

section() {
  echo
  echo "== $1 =="
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "  PASS: $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILED_CHECKS+=("$1")
  echo "  FAIL: $1"
}

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    pass "$label (status $actual)"
  else
    fail "$label (expected status $expected, got $actual; body: $BODY)"
  fi
}

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    pass "$label"
  else
    fail "$label (expected '$expected', got '$actual')"
  fi
}

assert_true() {
  local label="$1" condition="$2"
  if [[ "$condition" == "true" ]]; then
    pass "$label"
  else
    fail "$label (condition was false)"
  fi
}

# ── JSON + HTTP helpers ─────────────────────────────────────────────────

# json_get <json-string> <python-expr-on-d> — extracts a field via python3.
json_get() {
  python3 -c "
import json, sys
d = json.loads(sys.argv[1])
print($2)
" "$1" "$2" 2>/dev/null
}

# request <METHOD> <path> <cookie-jar-or-emptystring> [json-body]
# Sets $STATUS and $BODY. Uses the same jar for -b and -c so cookies persist.
request() {
  local method="$1" path="$2" jar="$3" body="${4:-}"
  local args=(-s -o "$WORKDIR/resp.json" -w '%{http_code}' -X "$method" "$API_BASE_URL$path" -H 'Content-Type: application/json')
  if [[ -n "$jar" ]]; then
    args+=(-b "$jar" -c "$jar")
  fi
  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi
  STATUS="$(curl "${args[@]}")"
  BODY="$(cat "$WORKDIR/resp.json")"
}

# request_headers <METHOD> <path> <cookie-jar> [json-body] — like request()
# but also captures response headers into $HEADERS (for Set-Cookie checks).
request_headers() {
  local method="$1" path="$2" jar="$3" body="${4:-}"
  local args=(-s -D "$WORKDIR/headers.txt" -o "$WORKDIR/resp.json" -w '%{http_code}' -X "$method" "$API_BASE_URL$path" -H 'Content-Type: application/json')
  if [[ -n "$jar" ]]; then
    args+=(-b "$jar" -c "$jar")
  fi
  if [[ -n "$body" ]]; then
    args+=(-d "$body")
  fi
  STATUS="$(curl "${args[@]}")"
  BODY="$(cat "$WORKDIR/resp.json")"
  HEADERS="$(cat "$WORKDIR/headers.txt")"
}

register() {
  local email="$1" password="$2" first="$3" last="$4"
  request POST /auth/register '' "{\"email\":\"$email\",\"password\":\"$password\",\"firstName\":\"$first\",\"lastName\":\"$last\"}"
}

login() {
  local email="$1" password="$2" jar="$3"
  request POST /auth/login "$jar" "{\"email\":\"$email\",\"password\":\"$password\"}"
}

# ── date helpers (UTC, matching the server's week-boundary logic) ──────

DOW="$(date -u +%u)" # 1=Mon..7=Sun
CURRENT_MONDAY="$(date -u -d "-$((DOW - 1)) days" +%Y-%m-%d)"
PAST_MONDAY="$(date -u -d "$CURRENT_MONDAY -8 weeks" +%Y-%m-%d)"
NON_MONDAY="$(date -u -d "$CURRENT_MONDAY +2 days" +%Y-%m-%d)"

echo "Backend E2E smoke test — RUN_ID=$RUN_ID"
echo "API_BASE_URL=$API_BASE_URL"
echo "CURRENT_MONDAY=$CURRENT_MONDAY  PAST_MONDAY=$PAST_MONDAY  NON_MONDAY=$NON_MONDAY"

# ── 0. Reachability ─────────────────────────────────────────────────────

section "0. Reachability"
request GET /projects ''
if [[ "$STATUS" != "401" ]]; then
  echo "FATAL: API not reachable/behaving as expected at $API_BASE_URL (got $STATUS for unauthenticated GET /projects)."
  echo "Is the stack running? (docker compose up -d)"
  exit 2
fi
pass "API reachable, unauthenticated request correctly rejected"

# ── 1. Auth module ───────────────────────────────────────────────────────

section "1. Auth — register/login/logout/me"

EMAIL_A="e2e-a-$RUN_ID@example.com"
EMAIL_B="e2e-b-$RUN_ID@example.com"
EMAIL_C="e2e-c-$RUN_ID@example.com"
EMAIL_D="e2e-d-$RUN_ID@example.com"
EMAIL_E="e2e-e-$RUN_ID@example.com"
PASSWORD="correcthorsebattery1"

JAR_A="$WORKDIR/cookies-a.txt"
JAR_B="$WORKDIR/cookies-b.txt"
JAR_C="$WORKDIR/cookies-c.txt"
JAR_MGR="$WORKDIR/cookies-manager.txt"

register "$EMAIL_A" "$PASSWORD" "E2E" "MemberA"
assert_status "register memberA" 201 "$STATUS"
ROLE_A="$(json_get "$BODY" "d['data']['role']")"
assert_eq "register memberA always TEAM_MEMBER" "TEAM_MEMBER" "$ROLE_A"
USER_A_ID="$(json_get "$BODY" "d['data']['id']")"

register "$EMAIL_A" "$PASSWORD" "E2E" "MemberA"
assert_status "duplicate email registration rejected" 409 "$STATUS"

request POST /auth/register '' "{\"email\":\"e2e-bad-$RUN_ID@example.com\",\"password\":\"$PASSWORD\"}"
assert_status "register missing required fields" 400 "$STATUS"

request POST /auth/register '' "{\"email\":\"e2e-role-$RUN_ID@example.com\",\"password\":\"$PASSWORD\",\"firstName\":\"X\",\"lastName\":\"Y\",\"role\":\"MANAGER\"}"
assert_status "register with client-supplied role rejected (forbidNonWhitelisted)" 400 "$STATUS"

request_headers POST /auth/login "$JAR_A" "{\"email\":\"$EMAIL_A\",\"password\":\"$PASSWORD\"}"
assert_status "login memberA" 200 "$STATUS"
if echo "$HEADERS" | grep -qi 'set-cookie:.*httponly' && echo "$HEADERS" | grep -qi 'set-cookie:.*secure' && echo "$HEADERS" | grep -qi 'set-cookie:.*samesite=strict'; then
  pass "login cookie has HttpOnly; Secure; SameSite=Strict"
else
  fail "login cookie missing expected flags (headers: $HEADERS)"
fi

login "$EMAIL_A" "wrongpassword" "$WORKDIR/cookies-wrong.txt"
assert_status "login wrong password" 401 "$STATUS"
WRONG_PW_MSG="$(json_get "$BODY" "d['message']")"

login "nonexistent-$RUN_ID@example.com" "whatever" "$WORKDIR/cookies-noone.txt"
assert_status "login nonexistent email" 401 "$STATUS"
NO_USER_MSG="$(json_get "$BODY" "d['message']")"
assert_eq "wrong-password and nonexistent-email give identical generic message (no user enumeration)" "$WRONG_PW_MSG" "$NO_USER_MSG"

request GET /auth/me "$JAR_A"
assert_status "GET /auth/me with valid cookie" 200 "$STATUS"
assert_eq "GET /auth/me returns the logged-in user" "$EMAIL_A" "$(json_get "$BODY" "d['data']['email']")"

request GET /auth/me ''
assert_status "GET /auth/me without cookie" 401 "$STATUS"

request POST /auth/logout "$JAR_A"
assert_status "logout" 200 "$STATUS"
assert_eq "logout response body" "True" "$(json_get "$BODY" "d['data']['success']")"

request GET /auth/me "$JAR_A"
assert_status "GET /auth/me after logout" 401 "$STATUS"

# Re-login memberA (logout invalidated the cookie) — needed for later sections.
login "$EMAIL_A" "$PASSWORD" "$JAR_A"
assert_status "re-login memberA after logout" 200 "$STATUS"

register "$EMAIL_B" "$PASSWORD" "E2E" "MemberB"
assert_status "register memberB" 201 "$STATUS"
USER_B_ID="$(json_get "$BODY" "d['data']['id']")"
login "$EMAIL_B" "$PASSWORD" "$JAR_B"
assert_status "login memberB" 200 "$STATUS"

register "$EMAIL_C" "$PASSWORD" "E2E" "MemberC"
assert_status "register memberC" 201 "$STATUS"
USER_C_ID="$(json_get "$BODY" "d['data']['id']")"
login "$EMAIL_C" "$PASSWORD" "$JAR_C"
assert_status "login memberC" 200 "$STATUS"

login "$SEED_MANAGER_EMAIL" "$SEED_MANAGER_PASSWORD" "$JAR_MGR"
assert_status "login seed manager" 200 "$STATUS"

# ── 2. Users module ──────────────────────────────────────────────────────

section "2. Users — list/get/patch, manager-only, role promotion"

request GET /users "$JAR_A"
assert_status "team member GET /users forbidden" 403 "$STATUS"

request GET /users ''
assert_status "unauthenticated GET /users" 401 "$STATUS"

request GET /users "$JAR_MGR"
assert_status "manager GET /users" 200 "$STATUS"

request GET /users/"$USER_A_ID" "$JAR_MGR"
assert_status "manager GET /users/:id" 200 "$STATUS"
assert_eq "GET /users/:id returns correct user" "$EMAIL_A" "$(json_get "$BODY" "d['data']['email']")"

request GET /users/not-a-uuid "$JAR_MGR"
assert_status "GET /users/:id malformed uuid" 400 "$STATUS"

request GET /users/00000000-0000-0000-0000-000000000000 "$JAR_MGR"
assert_status "GET /users/:id nonexistent" 404 "$STATUS"

request PATCH /users/"$USER_B_ID" "$JAR_A" '{"firstName":"Hacked"}'
assert_status "team member PATCH /users/:id forbidden" 403 "$STATUS"

# Stateless-JWT edge case: promoting memberC to MANAGER does not retroactively
# change memberC's already-issued token — they must re-login to pick it up.
request PATCH /users/"$USER_C_ID" "$JAR_MGR" '{"role":"MANAGER"}'
assert_status "manager promotes memberC to MANAGER" 200 "$STATUS"
assert_eq "promoted user has MANAGER role in response" "MANAGER" "$(json_get "$BODY" "d['data']['role']")"

request GET /users "$JAR_C"
assert_status "memberC's pre-promotion cookie still reads as old role (403 until re-login)" 403 "$STATUS"

login "$EMAIL_C" "$PASSWORD" "$JAR_C"
request GET /users "$JAR_C"
assert_status "memberC after re-login now has MANAGER access" 200 "$STATUS"

# ── 3. Projects module ───────────────────────────────────────────────────

section "3. Projects — CRUD, soft-delete"

PROJECT_A_NAME="E2E Project A $RUN_ID"
PROJECT_B_NAME="E2E Project B $RUN_ID"
PROJECT_C_NAME="E2E Project C $RUN_ID"

request GET /projects ''
assert_status "unauthenticated GET /projects" 401 "$STATUS"

request GET /projects "$JAR_A"
assert_status "team member GET /projects" 200 "$STATUS"

request POST /projects "$JAR_A" "{\"name\":\"$PROJECT_A_NAME\"}"
assert_status "team member POST /projects forbidden" 403 "$STATUS"

request POST /projects "$JAR_MGR" "{\"name\":\"$PROJECT_A_NAME\",\"description\":\"E2E fixture\"}"
assert_status "manager creates project A" 201 "$STATUS"
PROJECT_A_ID="$(json_get "$BODY" "d['data']['id']")"

request POST /projects "$JAR_MGR" "{\"name\":\"$PROJECT_A_NAME\"}"
assert_status "duplicate project name rejected" 409 "$STATUS"

request PATCH /projects/"$PROJECT_A_ID" "$JAR_MGR" '{"description":"Updated description"}'
assert_status "manager updates project A" 200 "$STATUS"

request PATCH /projects/"$PROJECT_A_ID" "$JAR_A" '{"description":"hacked"}'
assert_status "team member PATCH /projects/:id forbidden" 403 "$STATUS"

request POST /projects "$JAR_MGR" "{\"name\":\"$PROJECT_B_NAME\"}"
assert_status "manager creates project B" 201 "$STATUS"
PROJECT_B_ID="$(json_get "$BODY" "d['data']['id']")"

request POST /projects "$JAR_MGR" "{\"name\":\"$PROJECT_C_NAME\"}"
assert_status "manager creates project C" 201 "$STATUS"
PROJECT_C_ID="$(json_get "$BODY" "d['data']['id']")"

request DELETE /projects/"$PROJECT_C_ID" "$JAR_MGR"
assert_status "manager soft-deletes project C" 200 "$STATUS"
assert_eq "soft-deleted project has isActive=false" "False" "$(json_get "$BODY" "d['data']['isActive']")"

request GET /projects "$JAR_A"
PROJECT_C_STILL_LISTED="$(json_get "$BODY" "any(p['id']=='$PROJECT_C_ID' for p in d['data'])")"
assert_eq "soft-deleted project excluded from active list" "False" "$PROJECT_C_STILL_LISTED"

request DELETE /projects/00000000-0000-0000-0000-000000000000 "$JAR_MGR"
assert_status "delete nonexistent project" 404 "$STATUS"

request DELETE /projects/not-a-uuid "$JAR_MGR"
assert_status "delete malformed project id" 400 "$STATUS"

# ── 4. Project member assignment ─────────────────────────────────────────

section "4. Projects — member assignment"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_A" "{\"userId\":\"$USER_B_ID\"}"
assert_status "team member cannot assign project members" 403 "$STATUS"

request POST /projects/"$PROJECT_A_ID"/members '' "{\"userId\":\"$USER_B_ID\"}"
assert_status "unauthenticated cannot assign project members" 401 "$STATUS"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" "{\"userId\":\"$USER_B_ID\"}"
assert_status "manager assigns memberB to project A" 201 "$STATUS"
assert_eq "assignment response embeds the user" "$EMAIL_B" "$(json_get "$BODY" "d['data']['user']['email']")"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" "{\"userId\":\"$USER_B_ID\"}"
assert_status "duplicate assignment rejected" 409 "$STATUS"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" '{"userId":"00000000-0000-0000-0000-000000000000"}'
assert_status "assign nonexistent user" 404 "$STATUS"

request POST /projects/00000000-0000-0000-0000-000000000000/members "$JAR_MGR" "{\"userId\":\"$USER_B_ID\"}"
assert_status "assign to nonexistent project" 404 "$STATUS"

request DELETE /projects/"$PROJECT_A_ID"/members/"$USER_B_ID" "$JAR_MGR"
assert_status "manager unassigns memberB" 200 "$STATUS"

request DELETE /projects/"$PROJECT_A_ID"/members/"$USER_B_ID" "$JAR_MGR"
assert_status "unassign non-assignment" 404 "$STATUS"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" '{"userId":"not-a-uuid"}'
assert_status "assign malformed uuid" 400 "$STATUS"

request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" "{\"userId\":\"$USER_B_ID\",\"role\":\"MANAGER\"}"
assert_status "assign with extra field rejected (forbidNonWhitelisted)" 400 "$STATUS"

# Re-assign memberB to project A for the restriction-enforcement tests below.
request POST /projects/"$PROJECT_A_ID"/members "$JAR_MGR" "{\"userId\":\"$USER_B_ID\"}"
assert_status "re-assign memberB to project A" 201 "$STATUS"

# ── 5. Reports module ────────────────────────────────────────────────────

section "5. Reports — CRUD, week validation, submit, assignment restriction"

request POST /reports '' "{\"weekStartDate\":\"$CURRENT_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "unauthenticated create report" 401 "$STATUS"

request POST /reports "$JAR_MGR" "{\"weekStartDate\":\"$CURRENT_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "manager cannot create reports (TEAM_MEMBER only)" 403 "$STATUS"

request POST /reports "$JAR_A" "{\"weekStartDate\":\"$NON_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "non-Monday weekStartDate rejected" 400 "$STATUS"

# memberA has zero project assignments -> unrestricted, any active project works.
request POST /reports "$JAR_A" "{\"weekStartDate\":\"$CURRENT_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"Built the smoke tests\",\"tasksPlanned\":\"Ship it\",\"blockers\":\"None\",\"hoursWorked\":12.5}"
assert_status "unrestricted memberA creates current-week report" 201 "$STATUS"
REPORT_A_ID="$(json_get "$BODY" "d['data']['id']")"
assert_eq "weekEndDate derived as weekStartDate+6" "$(date -u -d "$CURRENT_MONDAY +6 days" +%Y-%m-%d)" "$(json_get "$BODY" "d['data']['weekEndDate']")"

request POST /reports "$JAR_A" "{\"weekStartDate\":\"$CURRENT_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "duplicate week for same member rejected" 409 "$STATUS"

request POST /reports "$JAR_A" "{\"weekStartDate\":\"$(date -u -d "$CURRENT_MONDAY +1 week" +%Y-%m-%d)\",\"projectId\":\"00000000-0000-0000-0000-000000000000\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "nonexistent projectId rejected" 400 "$STATUS"

request POST /reports "$JAR_A" "{\"weekStartDate\":\"$(date -u -d "$CURRENT_MONDAY +1 week" +%Y-%m-%d)\",\"projectId\":\"$PROJECT_C_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "soft-deleted (inactive) project rejected" 400 "$STATUS"

request POST /reports "$JAR_A" "{\"weekStartDate\":\"$(date -u -d "$CURRENT_MONDAY +1 week" +%Y-%m-%d)\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\",\"status\":\"SUBMITTED\"}"
assert_status "client-supplied status rejected (forbidNonWhitelisted)" 400 "$STATUS"

# memberB IS assigned (to project A only) -> restricted. Project A allowed, project B forbidden.
request POST /reports "$JAR_B" "{\"weekStartDate\":\"$PAST_MONDAY\",\"projectId\":\"$PROJECT_A_ID\",\"tasksCompleted\":\"Old work\",\"tasksPlanned\":\"More old work\",\"blockers\":\"None\"}"
assert_status "restricted memberB allowed on assigned project A" 201 "$STATUS"
REPORT_B_ID="$(json_get "$BODY" "d['data']['id']")"

request POST /reports "$JAR_B" "{\"weekStartDate\":\"$CURRENT_MONDAY\",\"projectId\":\"$PROJECT_B_ID\",\"tasksCompleted\":\"x\",\"tasksPlanned\":\"y\",\"blockers\":\"none\"}"
assert_status "restricted memberB forbidden on unassigned project B" 403 "$STATUS"

request GET /reports/my "$JAR_A"
assert_status "GET /reports/my" 200 "$STATUS"
assert_true "GET /reports/my includes memberA's report" "$(json_get "$BODY" "'true' if any(r['id']=='$REPORT_A_ID' for r in d['data']) else 'false'")"

request GET /reports/"$REPORT_A_ID" "$JAR_A"
assert_status "owner can GET own report" 200 "$STATUS"

request GET /reports/"$REPORT_A_ID" "$JAR_MGR"
assert_status "manager can GET any report" 200 "$STATUS"

request GET /reports/"$REPORT_A_ID" "$JAR_B"
assert_status "non-owner, non-manager cannot GET report" 403 "$STATUS"

request GET /reports/not-a-uuid "$JAR_A"
assert_status "GET /reports/:id malformed uuid" 400 "$STATUS"

request GET /reports/00000000-0000-0000-0000-000000000000 "$JAR_A"
assert_status "GET /reports/:id nonexistent" 404 "$STATUS"

request PATCH /reports/"$REPORT_A_ID" "$JAR_A" '{"blockers":"Updated blocker text","hoursWorked":15}'
assert_status "owner PATCHes own DRAFT report" 200 "$STATUS"

request PATCH /reports/"$REPORT_A_ID" "$JAR_MGR" '{"blockers":"manager edit"}'
assert_status "manager cannot PATCH a member's report (owner-only)" 403 "$STATUS"

request POST /reports/"$REPORT_B_ID"/submit "$JAR_B"
assert_status "submit a past-deadline report" 200 "$STATUS"
assert_eq "past-deadline submission derived as LATE" "LATE" "$(json_get "$BODY" "d['data']['status']")"

request POST /reports/"$REPORT_A_ID"/submit "$JAR_A"
assert_status "submit a current-week report" 200 "$STATUS"
assert_eq "current-week submission derived as SUBMITTED" "SUBMITTED" "$(json_get "$BODY" "d['data']['status']")"

request POST /reports/"$REPORT_A_ID"/submit "$JAR_A"
assert_status "re-submit an already-submitted report rejected" 409 "$STATUS"

request PATCH /reports/"$REPORT_A_ID" "$JAR_A" '{"blockers":"trying to edit after submit"}'
assert_status "PATCH after submit rejected (DRAFT only)" 403 "$STATUS"

request GET /reports "$JAR_A"
assert_status "team member cannot list all reports (manager-only)" 403 "$STATUS"

request GET /reports "$JAR_MGR"
assert_status "manager lists all reports" 200 "$STATUS"

request GET /reports?userId="$USER_A_ID" "$JAR_MGR"
assert_status "manager filters reports by userId" 200 "$STATUS"
ALL_MATCH_USER="$(json_get "$BODY" "'true' if all(r['userId']=='$USER_A_ID' for r in d['data']) else 'false'")"
assert_eq "userId filter returns only that member's reports" "true" "$ALL_MATCH_USER"

request GET "/reports?startDate=$CURRENT_MONDAY&endDate=$CURRENT_MONDAY" "$JAR_MGR"
assert_status "manager filters reports by date range" 200 "$STATUS"

request GET /reports?projectId=not-a-uuid "$JAR_MGR"
assert_status "manager filter with malformed uuid rejected" 400 "$STATUS"

# ── 6. Dashboard module (delta-based) ────────────────────────────────────

section "6. Dashboard — summary, charts, activity"

request GET /dashboard/summary ''
assert_status "unauthenticated dashboard summary" 401 "$STATUS"

request GET /dashboard/summary "$JAR_A"
assert_status "team member cannot view dashboard" 403 "$STATUS"

request GET /dashboard/summary "$JAR_MGR"
assert_status "manager views dashboard summary" 200 "$STATUS"
BASELINE_EXPECTED="$(json_get "$BODY" "d['data']['expectedMembers']")"
BASELINE_SUBMITTED="$(json_get "$BODY" "d['data']['submittedMembers']")"
BASELINE_PENDING="$(json_get "$BODY" "d['data']['pendingMembers']")"

register "$EMAIL_D" "$PASSWORD" "E2E" "MemberD"
assert_status "register memberD (will stay pending this week)" 201 "$STATUS"
USER_D_ID="$(json_get "$BODY" "d['data']['id']")"

register "$EMAIL_E" "$PASSWORD" "E2E" "MemberE"
assert_status "register memberE (will stay pending this week)" 201 "$STATUS"

request GET /dashboard/summary "$JAR_MGR"
assert_status "manager views dashboard summary again" 200 "$STATUS"
AFTER_EXPECTED="$(json_get "$BODY" "d['data']['expectedMembers']")"
AFTER_SUBMITTED="$(json_get "$BODY" "d['data']['submittedMembers']")"
AFTER_PENDING="$(json_get "$BODY" "d['data']['pendingMembers']")"
AFTER_COMPLIANCE="$(json_get "$BODY" "d['data']['complianceRate']")"

assert_eq "expectedMembers increased by exactly 2 (memberD, memberE)" "$((BASELINE_EXPECTED + 2))" "$AFTER_EXPECTED"
assert_eq "submittedMembers unchanged (D and E haven't submitted)" "$BASELINE_SUBMITTED" "$AFTER_SUBMITTED"
assert_eq "pendingMembers increased by exactly 2" "$((BASELINE_PENDING + 2))" "$AFTER_PENDING"

COMPLIANCE_OK="$(python3 -c "print('true' if abs($AFTER_COMPLIANCE - ($AFTER_SUBMITTED / $AFTER_EXPECTED)) < 1e-9 else 'false')")"
assert_eq "complianceRate == submittedMembers / expectedMembers" "true" "$COMPLIANCE_OK"

request GET /dashboard/charts/status "$JAR_MGR"
assert_status "manager views status chart" 200 "$STATUS"
D_STATUS="$(json_get "$BODY" "next((r['status'] for r in d['data'] if r['userId']=='$USER_D_ID'), None)")"
assert_eq "memberD (no report) shows as PENDING" "PENDING" "$D_STATUS"
A_STATUS="$(json_get "$BODY" "next((r['status'] for r in d['data'] if r['userId']=='$USER_A_ID'), None)")"
assert_eq "memberA (submitted current week) shows as SUBMITTED" "SUBMITTED" "$A_STATUS"

request GET /dashboard/charts/trend "$JAR_MGR"
assert_status "manager views trend chart" 200 "$STATUS"
CURRENT_WEEK_COUNT="$(json_get "$BODY" "next((p['reportCount'] for p in d['data'] if p['weekStartDate']=='$CURRENT_MONDAY'), 0)")"
assert_true "trend includes the current week with at least 1 report" "$(python3 -c "print('true' if $CURRENT_WEEK_COUNT >= 1 else 'false')")"

request GET /dashboard/charts/workload "$JAR_MGR"
assert_status "manager views workload chart" 200 "$STATUS"
PROJECT_A_REPORT_COUNT="$(json_get "$BODY" "next((p['reportCount'] for p in d['data'] if p['projectId']=='$PROJECT_A_ID'), 0)")"
assert_true "workload for project A counts both memberA and memberB reports (>=2)" "$(python3 -c "print('true' if $PROJECT_A_REPORT_COUNT >= 2 else 'false')")"

request GET /dashboard/activity "$JAR_MGR"
assert_status "manager views activity feed" 200 "$STATUS"
ACTIVITY_HAS_A="$(json_get "$BODY" "'true' if any(r['id']=='$REPORT_A_ID' for r in d['data']) else 'false'")"
assert_eq "activity feed includes memberA's submission" "true" "$ACTIVITY_HAS_A"

request GET /dashboard/charts/trend "$JAR_A"
assert_status "team member cannot view trend chart" 403 "$STATUS"

# ── summary ───────────────────────────────────────────────────────────────

echo
echo "=================================================="
echo "RESULTS: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=================================================="

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo
  echo "FAILED CHECKS:"
  for check in "${FAILED_CHECKS[@]}"; do
    echo "  - $check"
  done
  exit 1
fi

echo "ALL CHECKS PASSED"
exit 0
