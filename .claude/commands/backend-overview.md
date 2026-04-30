---
name: backend-overview
description: apps/backend (Hono + CockroachDB) のレイヤー構造と開発手順を俯瞰し、テストやミドルウェアの注意点を示す。
---

# スキル: backend-overview

## 概要
`apps/backend`（Hono.js + Drizzle + CockroachDB + Hyperdrive）で開発するときのクイックリファレンス。開発コマンド、Clean Architecture の依存方向、認証ミドルウェア、テスト方針をまとめる。

## 利用タイミング
- `src/presentation/routes` 配下に新しい API ルートを追加・レビューするとき。
- use case / repository / スキーマ / migration を変更するとき。
- feature / controller / use-case / repository / validator テストを追加・修正するとき。

## 主要コマンド
```
cd apps/backend
bun run dev          # Wrangler 開発サーバー (8080)
bun run type-check   # TypeScript 検証
bun run lint         # Biome
bun run test         # Jest
docker compose up -d # ローカル CockroachDB 起動
bun run db:generate  # Drizzle migration 生成
bun run db:migrate   # migration 適用
```

## アーキテクチャ
- 依存方向は `routes → controllers → use cases → repositories → db`。
- `src/index.ts` で Hono アプリを組み立て、CORS と各 route をマウントする。
- route は Composition Root として repository / use case / controller を束ねる。
- controller は use case interface のみ、use case は repository interface のみ依存する。
- Drizzle のクエリビルダを直接使うのは repository 層のみ。

## 認証とミドルウェア
- `authMiddleware` は `auth_token` を検証して認証済み操作を保護する。
- `contentAccessMiddleware` は、`access_token` の `event_id` と `x-event-id` が一致する場合、または `auth_token` が `admin` の場合のみ通過させる。
- frontend からの呼び出しでは `x-event-id` と適切な `Cookie` を必ず付与する（`buildContentFetchHeaders` を利用）。

## データベースと migration
- スキーマ定義は `src/db/schema.ts`。
- CockroachDB では複合 FK の前に参照先の `UNIQUE INDEX` が必要。
- `bun run db:generate` で `drizzle/<timestamp>_*` に migration を生成する。
- 再実行を考慮し、`CREATE UNIQUE INDEX IF NOT EXISTS` を優先する。

## テストピラミッド
- Feature test（`tests/features/*`）: route factory で Hono app を構築し、`JWT_SECRET` を含む mock env を渡して `app.request()` で検証。
- Controller test: use case をプレーンオブジェクトでモック。
- Use case test: repository をプレーンオブジェクトでモック。
- Repository test: Drizzle client のチェーン呼び出しを `jest.fn()` でモック。
- Validator test: Zod schema の単体検証。

## 実装チェックリスト
1. 永続化の変更がある場合は schema と migration を更新し、`bun run db:migrate` を実行。
2. repository / use case / controller を実装。
3. route で DI（`repositoryFactory`）を組み込む。
4. feature test と必要な unit test を追加。
5. `bun run type-check`、`bun run test`、`bun run lint` を通す。
6. コミットメッセージは日本語 Conventional Commits に従う。

## 補足
- 多くの route は `repositoryFactory` の差し替えを受け付けるため、feature test ではこの DI パターンを再利用する。
- `x-event-id` は `eventIdHeaderSchema` で検証し、失敗時は 400 を返す。
- use case の返り値は `result` union（`{ success: true; data } | { success: false; error }`）に統一する。
- Hyperdrive や JWT などの機密値は Wrangler の `secrets` で管理する。
