# Test MVP (items 41–65)

Last run: 2026-09-02. Backend `npm test`: **14 suites, 37 tests, exit 0**. Frontend `npm test` (`tsc --noEmit`): **exit 0**.

## Re-run

```bash
# Infra (postgres + redis). Host 5432/6379 may already be taken; this machine uses
# docker-compose.override.yml → localhost:5433 / 6381. Credentials stay ai:ai / ai_code_reviewer.
docker compose up -d postgres redis

cd ai-code-reviewer-backend
# DATABASE_URL must match compose user/db: postgresql://ai:ai@localhost:<port>/ai_code_reviewer
npx prisma db push
npm run demo:seed          # demo@local / demo-password
npm test                   # items 41–63 (Jest)
npm run eval               # same scoring used by items 47–48

cd ../ai-code-reviewer-frontend
npm test                   # tsc --noEmit (item 57)
```

Eval only (also documented in README):

```bash
cd ai-code-reviewer-backend
npm run eval               # writes eval/last-report.json
```

## Checklist

| Item | Check | Result | Notes |
| --- | --- | --- | --- |
| 41 | Unit: each tool rejects paths outside workspace | **pass** | `read_file`, `grep`, `list_files`, `run_lint`, `git_diff` reject `..` and absolute paths |
| 42 | Unit: grep cap respected | **pass** | `maxMatches` honored; hard cap 200 |
| 43 | Unit: agent loop stops at max tool calls | **pass** | `runToolAgent` stops at `MAX_TOOL_CALLS` (8) |
| 44 | Unit: sandbox reviewer works without OpenAI | **pass** | Placeholder key → `deterministic` review with findings |
| 45 | Unit: legacy mode still callable | **pass** | `reviewWorkspace(..., 'legacy')` and exported `runLegacyDump` |
| 46 | Unit: finding schema validation | **pass** | Zod `findingSchema` accept/reject |
| 47 | Eval: `npm run eval` exits 0 and writes a report | **pass** | Writes `eval/last-report.json` |
| 48 | Eval: precision is a number in [0,1] | **pass** | `precision`/`recall` in range |
| 49 | Integration: enqueue fixture 1, worker produces findings | **pass** | Queue add + `ValidationProcessor` persists findings |
| 50 | Integration: seed user can log in | **pass** | `POST /api/auth/login` `demo@local` / `demo-password` → 200 + token |
| 51 | API: unauthenticated validations 401 | **pass** | `GET /api/validations` → 401 |
| 52 | API: health shape | **pass** | `{ ok, redis, db, reviewMode }` (503 here: Redis not connected in the supertest process) |
| 53 | Worker: failed tool does not crash the job | **pass** | Throwing `grep` → job `success` |
| 54 | MCP server: `list_tools` + one grep in a fixture dir | **pass** | stdio MCP lists 3 tools and greps `01-null-deref` |
| 55 | Frontend: findings list renders from mock/API | **pass** | `FindingsPanel` + `normalizeValidation` wired on dashboard/detail |
| 56 | `npm test` in backend exits 0 | **pass** | 14 suites / 37 tests |
| 57 | Frontend typecheck or existing test script | **pass** | `npm test` → `tsc --noEmit` exit 0 |
| 58 | Compose: postgres+redis healthy | **pass** | `ai-code-reviewer-postgres-1` / `ai-code-reviewer-redis-1` healthy (api/web not started) |
| 59 | No secrets in test logs | **pass** | Eval stdout does not print fixture `sk-live-…` / `SuperSecret123` |
| 60 | Fixture labels are valid JSON | **pass** | All `fixtures/eval/*/labels.json` parse with `id`, `category`, `must_fix` |
| 61 | Path traversal fixture does not escape workspace | **pass** | Tools reject `../labels.json` from `17-path-traversal/input` |
| 62 | Leaked-secret fixture is labeled must_fix | **pass** | `03-leaked-secret` `must_fix` rules are `leaked_secret` |
| 63 | Style-only fixtures do not require must_fix | **pass** | `category: style` → `must_fix: []` |
| 64 | Document how to re-run eval | **pass** | README “Re-run eval (Test MVP)” + this file |
| 65 | Write TEST_MVP.md with pass/fail/skip | **pass** | This file |

**Totals:** 25 items → **25 pass / 0 fail / 0 skip**. Jest: **37 passed**.

## Unblocked leftover (Code MVP item 17)

`demo:seed` now succeeds. Local `DATABASE_URL` uses compose credentials `ai:ai` / `ai_code_reviewer` (not `user:password` / `ai_code_validator`). On this machine host ports are 5433/6381 because 5432/6379 were already bound.

## Out of scope

No deploy. No hosted MCP. No billing. No extra product features.
