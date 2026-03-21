# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bun monorepo with two Cloudflare Workers apps:
- `apps/backend` — Hono.js REST API with PostgreSQL + Drizzle ORM
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
bun run deploy       # Deploy to Cloudflare Workers (prod)
bun run deploy:dev   # Deploy to Cloudflare Workers (dev)
```

### Local database

```bash
cd apps/backend && docker compose up -d   # Start local PostgreSQL
```

## Architecture

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
└── index.ts              # Hono app entry point, binds routes
```

**Dependency flow:** routes → controllers → use cases → repositories → db

**Rules:**
- Routes are the Composition Root: create concrete repositories and use cases, inject into controllers
- Controllers depend only on use case **interfaces** (e.g. `IGetUsersUseCase`), never concrete classes
- Use cases depend only on repository **interfaces** (e.g. `IUserRepository`), never Drizzle directly
- Repository concrete classes are the only place that imports Drizzle (`sql`, `eq`, etc.)
- Cloudflare Workers `Env` bindings (`c.env`) are accessed only in routes

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
- Path alias: `@/` resolves to `src/` (e.g. `import ... from '@/use-cases/...'`)

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
├── page.tsx              # Home page
├── globals.css           # Tailwind v4 global styles
└── utils/client.ts       # Type-safe Hono API client (imports backend types)
```

The frontend imports Hono's type-safe client backed by backend route types, giving end-to-end TypeScript safety across the API boundary.

### Deployment

Both apps deploy to Cloudflare Workers. `wrangler.jsonc` in each app configures the worker name, routes, and bindings. In production the backend uses Cloudflare Hyperdrive for database connectivity.

## Code Style

- **Formatter/Linter**: Biome (configured in root `biome.json`)
- Indent: 4 spaces, line width: 80, single quotes, semicolons required
- `noUnusedImports` and `noUnusedVariables` are warnings
- Strict TypeScript in both apps
- Path alias: `@/` → `src/` (configured in all tsconfig files and `jest.config.ts`)

## MCP & Plugin Usage Policy

**IMPORTANT: Always use MCP tools and Plugins proactively for every request.**

### Serena MCP (code exploration and editing)
- Always prefer Serena MCP symbol tools (`find_symbol`, `get_symbols_overview`, `find_referencing_symbols`, `replace_symbol_body`, etc.) for all code search and editing tasks
- Reading entire files is a last resort; use Serena symbol tools to retrieve only the necessary parts first

### Context7 MCP (library documentation)
- For any question or implementation involving a library or framework (Hono, Drizzle, Next.js, Tailwind, Cloudflare Workers, etc.), always fetch up-to-date docs via Context7 MCP (`resolve-library-id` → `query-docs`) before responding or writing code

### Chrome DevTools MCP (browser interaction and debugging)
- Use Chrome DevTools MCP whenever browser automation, performance profiling, or debugging is required

### Plugins (skills)
- When a matching skill exists, always invoke it via the Skill tool before starting the task
- Examples: committing → `commit`, frontend implementation → `frontend-design`, feature development → `feature-dev`
