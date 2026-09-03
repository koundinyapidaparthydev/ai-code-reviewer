# Retest MVP (items 86–100)

**Codebird** reviewer demo. Last run: 2026-09-02. Local Docker Compose only. No cloud deploy. MCP not hosted.

Stack: web http://localhost:3002 · API http://localhost:5001 · Postgres 5433 · Redis 6381. Browser tab and login brand: **Codebird**.

## Checklist

| Item | Check | Result | Notes |
| --- | --- | --- | --- |
| 86 | Staging/local health | **pass** | `GET http://localhost:5001/health` → `{ ok: true, redis: true, db: true, reviewMode: "tools" }` |
| 87 | Log in as demo user | **pass** | `POST /api/auth/login` `demo@local` / `demo-password` → 200 + JWT. Login form regex rejected `demo@local` (required a dotted TLD); loosened and rebuilt `web`. |
| 88 | Open seeded validation; findings visible | **pass** | Seed job `e0eeac7c-…` “Demo seed from 01-null-deref”: 1 high `null_deref` on `profile.js:3`. Tools: `list_files`, `grep`, `run_lint`, `git_diff`. |
| 89 | Upload or trigger fixture 1; tools listed | **pass** | `POST /api/validations/manual` with `profile.js` → `ebeb3555-…` `success`, same finding + four tool calls. |
| 90 | `npm run eval` vs local-with-compose-config | **pass** | Host `npm run eval` (backend `.env` uses compose ports 5433/6381). 20 fixtures, precision/recall/f1 = 1. Wrote `ai-code-reviewer-backend/eval/last-report.json`. `GET /api/eval/last` 200. |
| 91 | Path-traversal cannot read `/etc/passwd` | **pass** | `read_file` `/etc/passwd` → “Absolute paths are not allowed”; `../../../../../etc/passwd` and `..` → “Path traversal rejected”. No passwd content. |
| 92 | Legacy mode not required for demo | **pass** | Health `reviewMode: tools`. Empty `OPENAI_API_KEY` → deterministic sandbox. Jobs `reviewMode: deterministic`. |
| 93 | Restart: seed user and last job still there | **pass** | `docker compose restart`. After health 200: login still works; same 5 job ids including last upload and seed; findings still present. |
| 94 | Failed/empty OpenAI key: sandbox findings | **pass** | API container `OPENAI_API_KEY` length 0. Upload and seed still return sandbox findings. |
| 95 | CORS from web origin | **pass** | Origin `http://localhost:3002`: preflight 204 + `Access-Control-Allow-Origin: http://localhost:3002`; GET `/health` and `/api/validations` include the same header + credentials. |
| 96 | MCP stdio locally (not staging) | **pass** | Host `mcp-server` stdio: `initialize`, `tools/list` (`read_file`, `grep`, `list_files`), `list_files` on `01-null-deref/input` → `profile.js`. Not in compose. |
| 97 | Fix only retest bugs | **pass** | Only the login email regex. No new features. No hosted MCP. No cloud. |
| 98 | 90-second demo notes | **pass** | See below. |
| 99 | No AplifyAI / Exam Prep leftovers in README | **pass** | Repo-wide search: no matches. README is Codebird only. |
| 100 | Mark reviewer demo MVP done | **pass** | This file. Reviewer demo MVP is done on local Compose. |

**Totals:** 15 items → **15 pass / 0 fail / 0 skip**.

**Fix applied:** `ai-code-reviewer-frontend/src/app/(auth)/login/page.tsx` — email pattern now accepts `demo@local` (TLD optional). Rebuilt local `web` image.

## 90-second demo

1. Stack already up: `curl -sS http://localhost:5001/health` → `{ ok, redis, db, reviewMode: "tools" }`.
2. Open http://localhost:3002/login. Sign in to **Codebird** with `demo@local` / `demo-password`.
3. Open Reviews. Click the card “Demo seed from 01-null-deref”.
4. Confirm the high null-deref finding on `profile.js` and the tools Codebird used (`list_files`, `grep`, `run_lint`, `git_diff`).
5. Optional: New review → upload `fixtures/eval/01-null-deref/input/profile.js` → same findings without an OpenAI key.

Host eval (not required for the live click-through): `npm run eval` from the repo root. MCP stays local stdio (`mcp-server/`); do not host it.

## Out of scope

No Railway/Fly/Render/Vercel. No TLS/custom domain. No hosted MCP. No extra product features.
