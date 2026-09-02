# Demo / staging (Deploy MVP)

Local Docker Compose is the deploy. Railway, Fly, Render, and Vercel CLIs were not logged in, so nothing was pushed to a host. TLS is skipped on localhost. No custom domain. No extra cloud services. MCP stays stdio-only (`mcp-server/`) and is not in this stack.

## URLs (this machine)

| Surface | URL |
| --- | --- |
| Web | http://localhost:3002 |
| API | http://localhost:5001 |
| Health (public) | http://localhost:5001/health |

Default compose ports are `3000` / `5000`. This machine already binds those (and `5432` / `6379`), so `docker-compose.override.yml` publishes **web 3002**, **API 5001**, **Postgres 5433**, **Redis 6381**. Container-to-container traffic still uses 3000 / 5000 / 5432 / 6379.

CORS origin is the web URL above (`FRONTEND_URL=http://localhost:3002`).

## Demo login

- Email: `demo@local`
- Password: `demo-password`

Do not invent other credentials.

## Env

- `REVIEW_MODE=tools`
- `OPENAI_API_KEY` empty → deterministic sandbox reviewer (no billed tokens)
- Compose DB: `ai:ai` / `ai_code_reviewer`
- Seed lives in the `pgdata` volume and survives `docker compose restart`

## Bring the stack up

```bash
docker compose up --build -d postgres redis api web
docker compose --profile seed run --rm seed
curl -sS http://localhost:5001/health
```

API container runs `npx prisma db push` on start. Images are the smallest local instances (256–512M limits). Logs redact fixture secret snippets (`sk-live-…`, `SuperSecret123`).

Health shape: `{ ok, redis, db, reviewMode }`.
