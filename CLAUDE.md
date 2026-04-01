# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bun monorepo with two Cloudflare Workers apps:
- `apps/backend` — Hono.js REST API with CockroachDB + Drizzle ORM
- `apps/frontend` — Next.js 15 (App Router) + React 19 + Tailwind CSS v4, deployed via OpenNext

## Commands

All commands use Bun as the package manager.

### Root (monorepo-wide)

```bash
bun install          # Install all workspace dependencies
bun run lint         # Biome lint across workspace
bun run lint:fix     # Auto-fix lint issues
```

### Backend (`apps/backend`)

```bash
bun run dev          # Dev server on port 8080
bun run type-check   # TypeScript validation (src + tests)
bun run test         # Jest unit tests
bun run lint         # Biome lint
bun run lint:fix     # Auto-fix
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:check     # Check migration state
bun run db:up        # Run pending migrations
bun run db:drop      # Drop migrations
bun run db:studio    # Open Drizzle Studio
bun run deploy       # Deploy to Cloudflare Workers (prod)
bun run deploy:dev   # Deploy to Cloudflare Workers (dev)
```

### Frontend (`apps/frontend`)

```bash
bun run dev          # Dev server on port 8771 (OpenNext + Wrangler)
bun run build        # Next.js build
bun run build:cloudflare  # OpenNext Cloudflare build
bun run preview      # Local preview with Wrangler
bun run type-check   # TypeScript validation
bun run lint         # Biome lint
bun run lint:fix     # Auto-fix
bun run test         # Jest (--forceExit)
bun run test:watch   # Jest watch mode
bun run deploy       # Deploy to Cloudflare Workers (prod)
bun run deploy:dev   # Deploy to Cloudflare Workers (dev)
```

### Local database

```bash
cd apps/backend
docker compose up -d   # Start CockroachDB (compose.yaml)
```

`apps/backend/compose.yaml` settings:
- Image: `cockroachdb/cockroach:latest`
- Database: `basic-knowledge-for-web`, User: `root`
- Ports: `26257` (SQL), `8888` (Admin UI — avoids conflict with backend dev server on `:8080`)
- Persistence: `db_data` volume

Set the following in `.env`, then run `bun run db:migrate`:

```env
DATABASE_URL=postgresql://root@localhost:26257/basic-knowledge-for-web?sslmode=disable
```

## Code Modification Checklist

**After every code change, follow this workflow before pushing.**

**Implementation order rule:** For features that span both backend and frontend, always implement in this order:

1. Backend implementation
2. Backend tests
3. Frontend implementation
4. Frontend tests

Do not start frontend implementation before the backend behavior and its tests are in place.

### 1. Verify all checks pass

```bash
# When changing backend
cd apps/backend
bun run type-check   # No TypeScript errors
bun run lint         # No Biome lint errors
bun run test         # All tests PASS

# When changing frontend
cd apps/frontend
bun run type-check   # No TypeScript errors
bun run lint         # No Biome lint errors
bun run test         # All tests PASS
```

Lint errors can often be auto-fixed with `bun run lint:fix`. Type errors and test failures must be fixed manually. The CI pipeline (`pull-request.yml`) runs the same checks — code that fails locally will fail in CI.

### 2. Split commits into meaningful units

Do **not** bundle unrelated changes into a single commit. Each commit should represent one logical change that can be reviewed and reverted independently.

**Good examples:**
- `feat(users): add GET /api/users endpoint` — new route only
- `test(users): add feature tests for GET /api/users` — tests only
- `feat(register): add registration form UI` — frontend only

**Bad examples:**
- One commit mixing schema changes, business logic, and UI updates
- "WIP" or "fix" commits with unrelated changes lumped together

Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

**Commit messages must be written in Japanese.** The subject line follows the format `<prefix>(<scope>): <Japanese description>`.

```
# Good
feat(users): GET /api/users エンドポイントを追加
fix(auth): JWTトークン検証のバグを修正
test(users): GET /api/users のフィーチャーテストを追加

# Bad
feat(users): add GET /api/users endpoint
fix: fixed bug
```

### 3. Push and open a Pull Request

After committing, push the branch and open a PR targeting `develop`:

```bash
git push -u origin <branch-name>
gh pr create --base develop
```

Every change must go through a PR — do not push directly to `develop` or `main`.

**PR title and description must be written in Japanese** and must follow the project template (`.github/pull_request_template.md`):

```markdown
# Pull Request

## What's changed
このプルリクは何をしたのかを記入してください。画像とテキストを使って説明するのがおすすめです。

## Todo List
今回のプルリクはまだやっていないことや、将来やる予定の事項を記入してください

- [ ] テストケースを書きます

## Remark
補足事項があれば記入してください
```

Example `gh pr create` command:

```bash
gh pr create --base develop --title "feat(users): GET /api/users エンドポイントを追加" --body "$(cat <<'EOF'
# Pull Request

## What's changed

`GET /api/users` エンドポイントを追加しました。

- ユーザー一覧を返すAPIを実装
- フィーチャーテストを追加

## Todo List

- [ ] 認証ミドルウェアの追加

## Remark

なし
EOF
)"
```

## Architecture

### System Architecture

```
[ Browser ]
    │
    ├── reitaisai.info          → Cloudflare Workers: basic-knowledge-for-web-frontend
    │       (OpenNext adapter)       Next.js 15 App Router
    │                                R2 bucket: next-cache (ISR cache)
    │
    └── reitaisai.info/api/*    → Cloudflare Workers: basic-knowledge-for-web-backend
            (Hono.js API)            Hyperdrive → CockroachDB (AWS ap-southeast-1)

[ dev.reitaisai.info / dev.reitaisai.info/api/* ] — dev environment (auto-deployed on push to develop)
[ reitaisai.info / reitaisai.info/api/* ]          — prod environment (auto-deployed on push to main)
```

### Backend — Clean Architecture

```
src/
├── db/                   # Drizzle schema + connection (Cloudflare Hyperdrive in prod)
├── use-cases/            # Business logic layer (one class per use case)
│   └── {domain}/
│       ├── I{Name}UseCase.ts   # Use case interface
│       └── {Name}UseCase.ts    # Concrete implementation
├── presentation/
│   ├── controllers/      # Request/response handling; accepts use case interfaces as args
│   └── routes/           # Composition Root — wires repositories + use cases, registers routes
├── infrastructure/
│   ├── validators/       # Zod schemas for request validation
│   └── repositories/
│       └── {domain}/
│           ├── I{Name}Repository.ts  # Repository interface
│           └── {Name}Repository.ts   # Concrete Drizzle implementation
└── index.ts              # Hono app entry point, binds routes; exports AppType
```

**Dependency flow:** routes → controllers → use cases → repositories → db

**Rules:**
- Routes are the Composition Root: create concrete repositories and use cases, inject into controllers
- Controllers depend only on use case **interfaces** (e.g. `IGetUsersUseCase`), never concrete classes
- Use cases depend only on repository **interfaces** (e.g. `IUserRepository`), never Drizzle directly
- Repository concrete classes are the only place that imports Drizzle (`sql`, `eq`, etc.)
- Cloudflare Workers `Env` bindings (`c.env`) are accessed only in routes
- `src/index.ts` exports `AppType` (the Hono app type) for frontend end-to-end type safety

### Backend — Database Schema

CockroachDB via Drizzle ORM (`src/db/schema.ts`):

```
users table:
  id          uuid        primary key, auto-generated (defaultRandom)
  name        varchar(255) not null
  email       varchar(255) not null, unique
  password    text         not null
  role        varchar(50)  default 'user'
  created_at  timestamp    auto-populated
  updated_at  timestamp    auto-populated
  deleted_at  timestamp    nullable (soft delete)
```

### Backend — Test Structure

```
tests/
├── tsconfig.json                                    # VSCode IntelliSense config (extends tsconfig.test.json)
├── helpers/
│   └── createTestApp.ts                             # Test app factory for Feature tests
├── features/
│   ├── health.test.ts                               # Feature tests: full HTTP stack for /api/health
│   └── users.test.ts                                # Feature tests: full HTTP stack for /api/users
├── use-cases/{domain}/*.test.ts                     # Unit tests for use cases (mock repository interfaces)
├── presentation/controllers/*.test.ts               # Unit tests for controllers (mock use case interfaces)
├── infrastructure/
│   ├── validators/*.test.ts                         # Unit tests for Zod validators
│   └── repositories/{domain}/*.test.ts              # Unit tests for repositories (mock DatabaseClient)
```

- Test runner: **Jest** with `ts-jest`
- Import source: `@jest/globals` (explicit imports, not globals)
- Path alias: `@backend/*` resolves to `src/` (e.g. `import ... from '@backend/use-cases/...'`)

### Backend — Testing Strategy (Test Pyramid)

```
          [Feature Tests]
    Route → Controller → UseCase(real) → Repository(mock)
    - Verifies HTTP request/response behavior end-to-end
    - Uses Hono's built-in app.request() — no supertest needed
    - Repository injected via factory function DI

        [Unit Tests — Controller]
    Controller(real) → IUseCase(mock)
    - Verifies HTTP status codes and response shapes
    - Mock: plain object literal implementing the interface

        [Unit Tests — UseCase]
    UseCase(real) → IRepository(mock)
    - Verifies business logic (email uniqueness, password hashing, etc.)
    - Mock: plain object literal implementing the interface

        [Unit Tests — Repository]
    Repository(real) → DatabaseClient(mock)
    - Verifies correct Drizzle query construction
    - Mock: jest.fn() chain matching the Drizzle query builder shape

        [Unit Tests — Validator]
    Zod schema only — no dependencies to mock
```

### Backend — Mocking Patterns by Layer

**Use case & controller mocks — plain object literal (preferred)**

Interfaces enable plain object mocks without `as unknown as ConcreteClass` casts:

```typescript
const mockUseCase: IGetUsersUseCase = {
    execute: jest.fn<() => Promise<...>>().mockResolvedValue({ success: true, data: [] }),
};
```

**Repository mock — Drizzle query chain**

Drizzle's query builder uses method chaining. Use `jest.fn().mockImplementation()` (not `mockResolvedValue`) to avoid TypeScript inferring `never` for the return type:

```typescript
// findAll: db.select().from(table)
const db = {
    select: jest.fn().mockReturnValue({
        from: jest.fn().mockImplementation(() => Promise.resolve([mockUser])),
    }),
} as unknown as DatabaseClient;

// findByEmail: db.select().from(table).where(...).limit(1)
const db = {
    select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
                limit: jest.fn().mockImplementation(() => Promise.resolve([mockUser])),
            }),
        }),
    }),
} as unknown as DatabaseClient;

// create: db.insert(table).values(input).returning()
const db = {
    insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
            returning: jest.fn().mockImplementation(() => Promise.resolve([newUser])),
        }),
    }),
} as unknown as DatabaseClient;
```

⚠️ `jest.fn().mockResolvedValue(value)` causes TS2345 `"not assignable to never"` when `jest.fn()` cannot infer its type parameter from context (common with `as unknown as DatabaseClient` casts). Use `mockImplementation(() => Promise.resolve(value))` instead for leaf mocks in chains.

**Feature test — repository factory DI**

Routes accept an optional `repositoryFactory` parameter for DI. Default uses the real Drizzle client; tests inject a mock:

```typescript
// Route definition
type UserRepositoryFactory = (env: Env) => IUserRepository;
export function createUserRoutes(
    repositoryFactory: UserRepositoryFactory = (env) =>
        new UserRepository(createDatabaseClient(env)),
) { ... }

// Feature test
const app = new Hono();
app.route('/api', createUserRoutes(() => mockRepository));
const res = await app.request('/api/users');
```

### Backend — TypeScript Configuration

| File | Purpose |
|---|---|
| `tsconfig.json` | Production source (`src/`) only. Uses `@cloudflare/workers-types`. Excludes `tests/`. |
| `tsconfig.test.json` | Used by Jest (`ts-jest`). Uses `@types/jest`. Includes `src/` + `tests/`. |
| `tests/tsconfig.json` | Extends `tsconfig.test.json`. Picked up by VSCode for test files. |

**⚠️ Type conflict:** `@cloudflare/workers-types` and `bun-types` must NOT be included in the same tsconfig.
They both define `Response` / `Body`, causing `Response.json()` to resolve to `Promise<undefined>` and breaking test matcher types.
Keep them in separate tsconfig files.

### Frontend — Next.js App Router

```
app/
├── layout.tsx            # Root layout (Geist font, global styles)
├── page.tsx              # Home page (client component, fetches /api/users)
├── register/
│   └── page.tsx          # User registration form (react-hook-form + zod)
├── globals.css           # Tailwind v4 global styles (CSS variables, dark mode)
├── utils/
│   └── client.ts         # Type-safe Hono API client (imports AppType from backend)
components/
└── ui/                   # shadcn/ui components (button, card, input, label)
```

**Key patterns:**
- `app/utils/client.ts` creates `hc<AppType>(NEXT_PUBLIC_API_URL)` for end-to-end type safety
- `register/page.tsx` imports `createUserSchema` directly from the backend package (shared validation)
- Client components use `'use client'` directive; forms use `react-hook-form` + `zodResolver`

### Frontend — Testing

```
tests/
├── tsconfig.json
├── mocks/
│   ├── server.ts         # MSW server: setupServer(...handlers)
│   └── handlers.ts       # HTTP request handlers for POST /api/users
└── register/
    └── page.test.tsx     # Component tests: render, validation, API success/error
```

**MSW v2 + Next.js 15 + jsdom setup (critical):**

Three files are required for MSW to work with Jest + jsdom:

1. **`jest.polyfills.ts`** — Web API polyfills (loaded via `setupFiles`):
   ```typescript
   // TextEncoder/TextDecoder, ReadableStream, WritableStream, TransformStream,
   // MessagePort, MessageChannel, BroadcastChannel, fetch (via cross-fetch)
   ```

2. **`jest.setup.ts`** — MSW server lifecycle (loaded via `setupFilesAfterFramework`):
   ```typescript
   beforeAll(() => server.listen())
   afterEach(() => server.resetHandlers())
   afterAll(() => server.close())
   ```

3. **`jest.config.ts`** — Critical MSW ESM handling:
   ```typescript
   // Disable custom export conditions to prevent MSW browser bundle being used
   // Add MSW packages to transformIgnorePatterns so Jest can transform them
   ```

**⚠️ Pitfalls:**
- MSW v2 packages are pure ESM; they must be listed in `transformIgnorePatterns` to be transformed by `ts-jest`
- `customExportConditions` must NOT include `browser`; otherwise MSW loads its browser bundle in Node
- `cross-fetch/polyfill` must be loaded before MSW server starts

### Frontend — TypeScript Configuration

| File | Purpose |
|---|---|
| `tsconfig.json` | Production source. Excludes jest files and tests. Path aliases: `@frontend/*`, `@backend/*`. |
| `tsconfig.test.json` | Used by Jest. Adds `@types/jest`, `@testing-library/jest-dom`. |
| `tests/tsconfig.json` | Extends `tsconfig.test.json`. Picked up by VSCode for test files. |

**Path aliases:**
- `@frontend/*` → project root (e.g. `@frontend/app/utils/client`)
- `@backend/*` → `../backend/*` (for importing backend types into frontend)

### Deployment

Both apps deploy to Cloudflare Workers. `wrangler.jsonc` in each app configures the worker name, routes, and bindings.

**Cloudflare resource bindings:**

| Resource | Dev | Prod |
|---|---|---|
| Backend Worker | `basic-knowledge-for-web-backend-dev` | `basic-knowledge-for-web-backend` |
| Frontend Worker | `basic-knowledge-for-web-frontend-dev` | `basic-knowledge-for-web-frontend` |
| Hyperdrive ID | `f7f0ede9c7464673ab6f5bdcf0753218` | `5a36ae3ca5ed4a4697040c00685f213e` |
| R2 Bucket | `basic-knowledge-for-web-next-cache-dev` | `basic-knowledge-for-web-next-cache` |
| DB Name | `Dev-BasicKnowledgeForWeb` | `BasicKnowledgeForWeb` |

- **Backend**: Uses Cloudflare Hyperdrive for database connectivity. Local dev uses `localConnectionString` in wrangler.jsonc (CockroachDB single-node).
- **Frontend**: Uses `@opennextjs/cloudflare` adapter. Build output at `.open-next/`. Uses R2 buckets for Next.js ISR cache.
- **API URL**: Configurable via `NEXT_PUBLIC_API_URL` env var (`http://localhost:8080` locally, `https://dev.reitaisai.info` or `https://reitaisai.info` in CI).

## CI/CD — GitHub Actions

### Workflows

| Workflow | Trigger | Jobs |
|---|---|---|
| `pull-request.yml` | PR → `main` or `develop` | lint-and-test-backend, verify-migration-backend, lint-and-test-frontend |
| `deploy-dev.yml` | push → `develop` | DB migrate → backend deploy → frontend deploy (env: dev) |
| `deploy-prod.yml` | push → `main` | DB migrate → backend deploy → frontend deploy (env: prod) |
| `security-scan.yml` | PR opened/sync | AikidoSec, Betterleaks, anti-trojan-source |

### PR Checks (pull-request.yml) — 3 parallel jobs

1. **lint-and-test-backend**: install → build → lint → type-check → jest
2. **verify-migration-backend**: start CockroachDB in Docker → create database → `bun run db:migrate`
3. **lint-and-test-frontend**: install → `build:cloudflare` → lint → type-check → jest

**Dependabot auto-merge**: Automatically approved and merged when all jobs pass and the update is not a major version bump.

### Required Secrets

| Secret | Used in |
|---|---|
| `CLOUDFLARE_API_TOKEN` | deploy workflows |
| `CLOUDFLARE_ACCOUNT_ID` | deploy workflows |
| `DATABASE_URL` | deploy workflows (db:migrate) |

## Environment Variables

### Backend (`.env.example`)

```env
DATABASE_URL=postgresql://root@localhost:26257/basic-knowledge-for-web?sslmode=disable
NODE_ENV=local
PORT=8080
```

### Frontend (`.env.example`)

```env
# local:      http://localhost:8080
# dev env:    https://dev.reitaisai.info
# prod env:   https://reitaisai.info
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Code Style

- **Formatter/Linter**: Biome (configured in root `biome.json`)
- Indent: 4 spaces, line width: 80, single quotes, semicolons required
- `noUnusedImports` and `noUnusedVariables` are warnings
- `noNonNullAssertion` is disabled
- Strict TypeScript in both apps
- Path aliases: `@backend/*` → `src/` (backend), `@frontend/*` / `@backend/*` (frontend)

## MCP & Plugin Usage Policy

**IMPORTANT: Always use MCP tools and Plugins proactively for every request.**

### Available MCP Tools

#### Serena MCP — Code Exploration & Editing

Explore and edit code at the symbol level. Always prefer symbol tools over reading entire files.

| Tool | Purpose |
|---|---|
| `get_symbols_overview` | List all symbols in a file |
| `find_symbol` | Search for a symbol by name path and read its body |
| `find_referencing_symbols` | Find all references to a symbol |
| `replace_symbol_body` | Replace an entire symbol definition |
| `insert_after_symbol` / `insert_before_symbol` | Insert code before or after a symbol |
| `replace_content` | Regex-based in-file replacement |
| `search_for_pattern` | Search across the entire codebase by pattern |

**Principle**: Reading an entire file is a last resort. Start with `get_symbols_overview` to understand the file structure, then use `find_symbol` to read only the symbols you need.

#### Context7 MCP — Library Documentation

Always use this for any question or implementation involving a library or framework. Prefer up-to-date docs over pre-trained knowledge.

```
1. resolve-library-id  — get the library ID
2. query-docs          — fetch the documentation
```

Applicable to: Hono, Drizzle ORM, Next.js, Tailwind CSS v4, Cloudflare Workers, OpenNext, MSW, react-hook-form, shadcn/ui, etc.

#### Chrome DevTools MCP — Browser Automation & Debugging

Use when browser automation, performance profiling, or debugging is required.

| Tool | Purpose |
|---|---|
| `take_screenshot` | Capture the current page |
| `navigate_page` | Navigate to a URL |
| `click` / `fill` / `type_text` | Interact with UI elements |
| `evaluate_script` | Run a script in the browser console |
| `list_network_requests` | Inspect network traffic |
| `lighthouse_audit` | Run a Lighthouse performance audit |
| `performance_start_trace` / `performance_stop_trace` | Record a performance trace |

#### Cloudflare MCP — Cloudflare Resource Management

| Plugin | Purpose |
|---|---|
| `cloudflare-bindings` | CRUD operations for KV / D1 / R2 / Hyperdrive |
| `cloudflare-builds` | Inspect Workers build logs and debug failures |
| `cloudflare-observability` | Query production Workers logs and metrics |
| `cloudflare-docs` | Search official Cloudflare documentation |
| `cloudflare-api` | General-purpose Cloudflare API execution |

**Common workflow**: On deploy failure → check build logs with `cloudflare-builds` → inspect production logs with `cloudflare-observability`.

#### CockroachDB Cloud MCP — Direct Database Access

Run queries directly against the CockroachDB Cloud cluster.

| Tool | Purpose |
|---|---|
| `list_clusters` / `get_cluster` | Inspect cluster state |
| `list_databases` / `list_tables` | List databases and tables |
| `get_table_schema` | Inspect a table schema |
| `select_query` | Execute a SELECT query |
| `insert_rows` | Insert rows |
| `explain_query` | View query execution plan |

#### Playwright MCP — Browser Automation (fallback)

Use Playwright for browser automation when Chrome DevTools MCP is unavailable.

### Plugins (Skills)

| Scenario | Skill to invoke |
|---|---|
| Create a commit | `commit` |
| Frontend implementation | `frontend-design` |
| Feature development | `feature-dev` |
| Code review | `code-review` |
| Commit + push + open PR | `commit-push-pr` |
| Cloudflare Workers implementation | `cloudflare:workers-best-practices` |
| Build an MCP server | `cloudflare:building-mcp-server-on-cloudflare` |

When a matching skill exists, always invoke it via the `Skill` tool before starting the task.

## Implementation Considerations

### Branch Naming Convention

| Prefix | When to use |
|---|---|
| `feature/` | New features or enhancements |
| `fix/` | Bug fixes |
| `docs/` | Documentation only changes |
| `chore/` | Refactoring, tooling, dependency updates |

Always branch off `develop`. PRs target `develop`; `develop` merges into `main` for production releases.

### Authentication (Planned)

JWT-based authentication will be added. When implementing:
- Token issuance and validation belong in the use case layer
- The JWT secret should be stored as a Cloudflare Workers secret (not in `wrangler.jsonc`)
- Authenticated routes should verify tokens in middleware or at the route level, before reaching controllers

### Roles & RBAC (Planned)

The `users.role` field will support three roles:

| Role | Description |
|---|---|
| `user` | Default role for registered users |
| `developer` | Extended access for developers |
| `admin` | Full administrative access |

RBAC will be enforced at the route or use case layer. Add role checks as a dedicated use case concern, not inside repositories.

### Soft Delete (Planned)

The `deleted_at` column exists on all tables. When implementing:
- All `findAll` and `findByEmail` queries must add `.where(isNull(table.deletedAt))`
- Deletion endpoints should `UPDATE ... SET deleted_at = now()` rather than `DELETE`
- Never expose soft-deleted records in API responses

### Checklist for adding a new domain

Steps to add a new resource (e.g. `posts`) to the backend:

1. **Schema** (`src/db/schema.ts`) — add the Drizzle table definition
2. **Migration** — `bun run db:generate` → `bun run db:migrate`
3. **Repository** — `IPostRepository.ts` (interface) + `PostRepository.ts` (Drizzle implementation)
4. **Validator** — `src/infrastructure/validators/postValidator.ts` (Zod schema)
5. **Use Cases** — `ICreatePostUseCase.ts` + `CreatePostUseCase.ts`, etc.
6. **Controller** — `src/presentation/controllers/postController.ts`
7. **Routes** — `src/presentation/routes/postRoutes.ts` (Composition Root)
8. **Mount** — add `app.route('/api', createPostRoutes())` to `src/index.ts`
9. **Tests** — add tests for each layer (feature → controller → use-case → repository → validator)

### CORS

CORS is configured in `src/index.ts`. Allowed origins:
- `https://reitaisai.info`
- `https://dev.reitaisai.info`
- `http://localhost:8771`

Update the CORS configuration in `src/index.ts` when a new origin is needed.

### Shared Zod Schemas

Validation schemas (e.g. `createUserSchema`) can be imported in the frontend as `@backend/infrastructure/validators/userValidator`. Reuse backend-defined schemas in the frontend to avoid duplication.

### Password Hashing

`bcryptjs` with salt rounds 12. Plain-text passwords received from the frontend are hashed inside `CreateUserUseCase`. Passwords must never appear in API responses.

### Result Type (Discriminated Union)

Use case return values must always follow the shape `{ success: true; data: T } | { success: false; error: string }`. Controllers branch on the `success` flag to determine the HTTP status code.

### Cloudflare Workers Constraints

- Module-level global state persists across requests within a single Worker instance. DB connections are created per-request by design (Hyperdrive manages the connection pool).
- Including `bun-types` in the Workers tsconfig conflicts with `@cloudflare/workers-types` on `Response` / `Body`. Use only `@cloudflare/workers-types` in the production tsconfig.
- The `nodejs_compat` compatibility flag is enabled, so Node.js built-ins (crypto, buffer, etc.) are available.

### Security Scanning

The following scans run automatically when a PR is opened:
- **AikidoSec Safe Chain** — dependency vulnerability scanning
- **Betterleaks** — secret leak detection
- **anti-trojan-source** — detects code obfuscation via Unicode control characters

Secrets (`.env`, `terraform.tfvars`, etc.) are excluded via `.gitignore`. Always run `git status` before committing to verify no secrets are staged.
