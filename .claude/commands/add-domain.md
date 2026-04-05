---
name: add-domain
description: バックエンドに新しいドメイン（リソース）を追加する。スキーマ定義からテストまでのチェックリストに従い、Clean Architecture のレイヤーを順番に実装する。
---

# /add-domain — 新ドメイン追加

ユーザーが追加したいリソース名（例: `posts`, `announcements`）と、必要なフィールド情報を提供する。

## 実装順序

以下の順番で厳密に実装する。順番を変えてはならない。

### 1. Schema (`src/db/schema.ts`)

Drizzle の `cockroachTable` でテーブルを定義する。

- PK: `uuid('id').defaultRandom().primaryKey()`
- `event_id`: `uuid('event_id').notNull().references(() => accessCodes.id, { onDelete: 'restrict' })`
- `created_at` / `updated_at`: `timestamp` with `defaultNow()`
- 複合 FK が必要な場合は table callback で `foreignKey()` を使用し、UNIQUE INDEX も同時に追加する

**⚠️ CockroachDB 複合 FK の注意:**
migration ファイルで `CREATE UNIQUE INDEX IF NOT EXISTS` を `ADD CONSTRAINT ... FOREIGN KEY` より**前**に記述すること。

### 2. Migration

```bash
cd apps/backend
bun run db:generate   # migration ファイルを生成
# migration.sql を確認し、FK の順序が正しいか検証
bun run db:migrate    # 適用
```

### 3. Repository Interface (`src/infrastructure/repositories/{domain}/I{Name}Repository.ts`)

```typescript
export interface I{Name}Repository {
    findByEventId(eventId: string): Promise<{Name}[]>;
}
```

### 4. Repository Implementation (`src/infrastructure/repositories/{domain}/{Name}Repository.ts`)

- Drizzle クエリを実装する唯一の場所
- `import { eq, asc } from 'drizzle-orm'` — `drizzle-orm` から
- `alias` が必要な場合は `drizzle-orm/cockroach-core` から import
- 並び順は docs の仕様に従う

### 5. Validator (`src/infrastructure/validators/{domain}Validator.ts`)

- Zod スキーマで `event_id`（uuid）と主要フィールドを定義
- `x-event-id` ヘッダーのバリデーションを含める

### 6. Use Case Interface + Implementation (`src/use-cases/{domain}/`)

```typescript
// IGet{Name}sUseCase.ts
export interface IGet{Name}sUseCase {
    execute(eventId: string): Promise<{ success: true; data: {Name}[] } | { success: false; error: string }>;
}
```

返り値は必ず `{ success: true; data: T } | { success: false; error: string }` の Discriminated Union にする。

### 7. Controller (`src/presentation/controllers/{domain}Controller.ts`)

- `IGet{Name}sUseCase` インターフェースにのみ依存（具象クラスは import しない）
- `x-event-id` ヘッダーが未指定の場合は `400` を返す

### 8. Routes (`src/presentation/routes/{domain}Routes.ts`)

- Composition Root: 具象 Repository・UseCase を生成して Controller に注入
- **全コンテンツ GET API に `contentAccessMiddleware` を適用する**

```typescript
import { contentAccessMiddleware } from '../middleware/contentAccessMiddleware';

app.get('/api/{resource}', contentAccessMiddleware, async (c) => { ... });
```

### 9. Mount (`src/index.ts`)

```typescript
import { create{Name}Routes } from './presentation/routes/{domain}Routes';
app.route('/api', create{Name}Routes());
```

### 10. Tests

実装後、以下の順でテストを追加する:

| テスト | 場所 | 何を確認するか |
|---|---|---|
| Validator | `tests/infrastructure/validators/{domain}Validator.test.ts` | フィールドの型・必須チェック |
| Repository | `tests/infrastructure/repositories/{domain}/{Name}Repository.test.ts` | Drizzle クエリチェーンと order |
| Use Case | `tests/use-cases/{domain}/Get{Name}sUseCase.test.ts` | 正常系・異常系の business logic |
| Controller | `tests/presentation/controllers/{domain}Controller.test.ts` | HTTP ステータスコードとレスポンス形状 |
| Feature | `tests/features/{domain}.test.ts` | E2E: access_token / auth_token / 401 ケース |

Feature テストのパターン:
```typescript
const mockEnv = { JWT_SECRET } as unknown as Env;
// access_token: sign({ event_id, exp }, JWT_SECRET, 'HS256')
// auth_token(admin): sign({ id, name, email, role: 'admin', exp }, JWT_SECRET, 'HS256')
// auth_token(user): sign({ ..., role: 'user', exp }, ... ) → 401 が期待値

const res = await app.request('/api/{resource}', {
    headers: { 'x-event-id': eventId, Cookie: `access_token=${token}` },
}, mockEnv);
```

## 完了条件

```bash
cd apps/backend
bun run type-check   # TypeScript エラーなし
bun run lint         # Biome lint エラーなし（auto-fix: bun run lint:fix）
bun run test         # 全テスト PASS
```
