---
name: db-migrate
description: Drizzle マイグレーションを生成・適用する。CockroachDB の複合FK制約に対応した安全な手順をガイドする。
---

# /db-migrate — データベースマイグレーション

`src/db/schema.ts` を変更した後にこのスキルを使用する。

## 手順

### 1. ローカル CockroachDB が起動しているか確認

```bash
cd apps/backend
docker compose up -d
```

`.env` に以下が設定されていること:
```env
DATABASE_URL=postgresql://root@localhost:26257/basic-knowledge-for-web?sslmode=disable
```

### 2. Migration ファイルを生成

```bash
bun run db:generate
```

生成されたファイルは `drizzle/` 以下に配置される。

### 3. Migration SQL を確認する（重要）

生成された `migration.sql` を必ず開いて確認する:

**⚠️ CockroachDB — 複合 FK の順序チェック:**

複合外部キー（例: `rooms.(event_id, day_manager_id) → departments(event_id, id)`）が含まれる場合、
`CREATE UNIQUE INDEX` が `ADD CONSTRAINT ... FOREIGN KEY` より**前**に来ているか確認する。

Drizzle が逆順で生成した場合は手動で並び替える:

```sql
-- ✅ 正しい順序
CREATE UNIQUE INDEX IF NOT EXISTS "departments_event_id_id_idx" ON "departments" ("event_id","id");--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "..." FOREIGN KEY ...;

-- ❌ 誤った順序（FK が先だと CockroachDB がエラーになる）
ALTER TABLE "rooms" ADD CONSTRAINT "..." FOREIGN KEY ...;
CREATE UNIQUE INDEX ...;
```

`IF NOT EXISTS` を付けることで、部分実行後の再試行時にエラーにならない。

### 4. Migration を適用

```bash
bun run db:migrate
```

### 5. 失敗した場合の対処

**「index already exists」エラー:**
migration.sql の `CREATE INDEX` に `IF NOT EXISTS` を追加して再実行。

**「constraint does not exist」で DROP CONSTRAINT が失敗:**
migration が参照している制約がDBに存在しない場合。
`ALTER TABLE ... DROP CONSTRAINT ...` の行を削除して再実行。

**migration の状態確認:**
```bash
bun run db:check   # 未適用の migration を確認
```

### 6. CI での確認

`pull-request.yml` の `verify-migration-backend` ジョブが:
- CockroachDB を Docker で起動
- DB を作成
- `bun run db:migrate` を実行

ローカルで通った migration がCIでも通ることを確認してからPRを作成する。
