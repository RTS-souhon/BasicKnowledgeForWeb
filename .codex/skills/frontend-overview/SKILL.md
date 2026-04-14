---
name: frontend-overview
description: apps/frontend (Next.js 15 + OpenNext) の構成とワークフローを俯瞰し、開発・テスト・認証連携の要点をまとめる。
---

# Skill: frontend-overview

## Overview
How to work on `apps/frontend`, a Next.js 15 (App Router) app deployed via OpenNext on Cloudflare Workers. Covers dev commands, layout/middleware expectations, and cross-cutting patterns (shared validators, MSW-powered tests, Cloudflare fetch headers).

## When to use
- Bootstrapping any feature under `apps/frontend/app/**`.
- Remembering how authentication state and `event_id` move between middleware, layout, headers, and pages.
- Adding tests (Jest + Testing Library + MSW) or running the standard Bun toolchain.

## Key Commands
```
cd apps/frontend
bun run dev              # OpenNext+Wrangler dev server (:8771)
bun run build            # Next build
bun run build:cloudflare # OpenNext Cloudflare bundle
yarn run? nope, always Bun
bun run type-check
bun run lint             # Biome
ebun run test             # Jest (--forceExit)
```

## Architecture Notes
- App Router with layout nesting: `(authenticated)` group backed by middleware that enforces cookie presence.
- Shared API client via `app/utils/client.ts` (Hono `hc<AppType>`)
- Authentication helpers (`app/lib/serverAuth.ts`) decode `auth_token` / `access_token` cookies server-side; never call `cookies()` directly in many places.
- Navigation/header lives in `components/AuthHeader.tsx` + `EventSelector.tsx`; preserve `event_id` query for admin/dev.
- All backend fetches must send `Cookie` + `x-event-id` via `buildContentFetchHeaders` to satisfy `contentAccessMiddleware` requirements.

## Testing
- Jest config already wires MSW + polyfills. Tests live in `apps/frontend/tests/**`.
- For server components: import the component after mocking `@frontend/app/lib/serverAuth` so `cookies()` isn’t invoked.
- Use `AppRouterWrapper` helper (under `tests/helpers`) to supply router context when rendering client components.
- `bun run test` emits an open-handle warning due to MSW; acceptable.

## Workflow Checklist
1. Implement backend piece first if a new API is needed (per AGENTS.md), then move to frontend.
2. Add/modify Server Component using `resolveAuth` + fetch helpers.
3. Update header/nav if query propagation is necessary.
4. Add or adjust `apps/frontend/tests/**` to cover new behavior.
5. Run `bun run type-check && bun run test && bun run lint`.
6. Commit with Japanese Conventional Commit subject.

## Tips
- Prefer shared validators from backend via `@backend/...` imports instead of duplicating schemas.
- Use Tailwind utility order enforced by Biome’s `useSortedClasses` (warnings show suggested order).
- When building fetch URLs, default `NEXT_PUBLIC_API_URL` to `http://localhost:8080` for local dev.
- Keep `event_id` in URL for admin/dev flows; user flows rely on `access_token` payload only.
