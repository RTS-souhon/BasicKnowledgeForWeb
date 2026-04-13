---
name: backend-overview
description: apps/backend (Hono + CockroachDB) のレイヤー構造と開発手順を俯瞰し、テストやミドルウェアの注意点を示す。
---

# Skill: backend-overview

## Overview
Cheat sheet for `apps/backend`, a Hono.js REST API targeting Cloudflare Workers with CockroachDB via Drizzle ORM + Hyperdrive. Covers dev commands, clean architecture layering, middleware expectations, and testing patterns.

## When to use
- Implementing or reviewing new API routes under `src/presentation/routes`.
- Adjusting use cases/repositories or DB schema/migrations.
- Writing tests (feature/controller/use-case/repository/validator) or running Bun toolchain.

## Key Commands
```
cd apps/backend
bun run dev          # Wrangler dev (port 8080)
bun run type-check   # TS validation
bun run lint         # Biome
bun run test         # Jest
docker compose up -d # CockroachDB for local db:generate/db:migrate
bun run db:generate  # Drizzle migration
bun run db:migrate   # Apply migrations
```

## Architecture
- Clean architecture layering: routes → controllers → use cases → repositories → db.
- `src/index.ts` wires Hono app, CORS, and mounts routes.
- Routes are composition roots: instantiate repositories (`createDatabaseClient(env)`), use cases, controllers.
- Controllers accept interfaces for use cases; use cases accept repository interfaces.
- Repositories are the only place importing Drizzle query builders.

## Auth & Middleware
- `authMiddleware` verifies `auth_token` cookie for admin/dev operations.
- `contentAccessMiddleware`: allows access if `access_token` is valid and `event_id` matches `x-event-id`, or if `auth_token` has admin/developer role.
- Headers from frontend must include `x-event-id` plus appropriate `Cookie` (handled via `buildContentFetchHeaders`).

## Database & Migrations
- Drizzle schema lives in `src/db/schema.ts`; CockroachDB quirks (composite FK requires `UNIQUE` index before `FOREIGN KEY`).
- Use `bun run db:generate` to create timestamped migration under `drizzle/<timestamp>_*`.
- Remember to add `IF NOT EXISTS` for unique indexes when migrations can re-run.

## Testing Pyramid
- Feature tests (`tests/features/*`): spin up Hono app with route factory, pass mock env with `JWT_SECRET`, use `app.request()`.
- Controller tests: mock use case object literal.
- Use case tests: mock repository object literal.
- Repository tests: mock Drizzle client via chained jest.fn().
- Validator tests: plain Zod schema assertions.

## Workflow Checklist
1. Update DB schema + migration if persistence changes are needed. Run `bun run db:migrate` locally.
2. Implement repository/use case/controller changes.
3. Wire route composition (inject repository factory).
4. Add/extend tests (feature + relevant unit layers).
5. Run `bun run type-check`, `bun run test`, `bun run lint`.
6. Follow Conventional Commits (Japanese) for commit messages.

## Tips
- Routes often accept an optional repository factory for dependency injection in tests; reuse pattern.
- Use `eventIdHeaderSchema` (Zod) to validate `x-event-id` input; return 400 on failure.
- Keep `result` union (`{ success: true; data } | { success: false; error }`) consistent across use cases.
- For Hyperdrive secrets, configure via Wrangler `secrets` (never plain `vars`).
