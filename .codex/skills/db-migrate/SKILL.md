---
name: db-migrate
description: Drizzle のスキーマ変更後に CockroachDB 向けマイグレーションを生成・検証・適用する具体的な手順。複合FKでのインデックス順序チェックや失敗時の対処も含む。
---

# Drizzle マイグレーション手順

/.claude/commands/db-migrate.md のガイドをプロジェクトローカル化。`apps/backend/src/db/schema.ts` を触ったら即実施する。

## 1. ローカル CockroachDB を起動
```bash
cd apps/backend
docker compose up -d
```
`.env` に `DATABASE_URL=postgresql://root@localhost:26257/basic-knowledge-for-web?sslmode=disable` を設定してから続行。

## 2. Migration ファイル生成
```bash
bun run db:generate
```
生成物は `apps/backend/drizzle/` 以下。

## 3. `migration.sql` を必ず目視確認
- 複合 FK を追加する場合、`CREATE UNIQUE INDEX IF NOT EXISTS ...` が `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY` より前に来ているかチェック。
- 順序が逆なら手で並び替える。
- `IF NOT EXISTS` を付けておくと途中失敗後の再実行でも安全。

## 4. Migration 適用
```bash
bun run db:migrate
```
失敗したら SQL を修正し、必要に応じて `db:generate` → `db:migrate` をやり直す。

## 5. トラブルシューティング
- `index already exists` → `CREATE INDEX` に `IF NOT EXISTS` を追加。
- `constraint does not exist`（DROP CONSTRAINT 失敗）→ その行を削除して再実行。
- 状態がわからない場合 → `bun run db:check` で未適用 migration を確認。

## 6. CI との整合
`pull-request.yml` の `verify-migration-backend` ジョブでは Docker で CockroachDB を立ち上げ、`bun run db:migrate` を実行する。ローカルで通らない migration は CI でも必ず落ちるため、上記手順で安全性を担保してからコミットする。
