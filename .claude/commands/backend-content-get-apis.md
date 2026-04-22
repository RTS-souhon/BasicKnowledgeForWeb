---
name: backend-content-get-apis
description: コンテンツ系 GET API（timetable / rooms / programs / shop-items / others / search）を追加・改修するときに使う。現行実装の middleware・テスト・DI パターンに沿った手順を示す。
---

# Backend Content GET API ガイド

参照: `AGENTS.md`, `apps/backend/src/presentation/routes/*.ts`, `apps/backend/tests/features/*.test.ts`

## 前提
- 対象: `timetable / rooms / programs / shop-items / others / search` の閲覧API
- GET は `contentAccessMiddleware` を適用し、`x-event-id` を前提に実装する
- CockroachDB の複合FK順序制約に注意

## 手順
1. **Schema 拡張** (`apps/backend/src/db/schema.ts`)
   - `event_id` は `access_codes.id` 参照（`ON DELETE RESTRICT`）を基本とする。
   - 部屋テーブルのように複合 FK が必要な場合は参照先に `UNIQUE INDEX` を先に用意する。
2. **マイグレーション**
   - `bun run db:generate` 後、`CREATE UNIQUE INDEX IF NOT EXISTS ...` が `ADD CONSTRAINT ... FOREIGN KEY` より先になるよう確認/修正。
   - `bun run db:migrate` で適用。
3. **レイヤー実装**
   - Validator: `eventIdHeaderSchema` と各ドメイン validator を利用/拡張。
   - Repository: 並び順契約を守る（例: timetable/programs=`start_time`、rooms=building→floor→room、others=`display_order`）。
   - Use Case: `{ success: true; data } | { success: false; error }` 遵守。
   - Controller: `x-event-id` 不備は 400、use case 失敗は 500 を返す。
   - Routes: GET は `contentAccessMiddleware`、編集系は `contentEditMiddleware` + `roleGuard(['admin'])` を適用。
   - ルートは `createXxxRoutes(repositoryFactory?)` で DI 可能にして feature test を書きやすくする。
   - `src/index.ts` に各 routes を `app.route('/api', createXxxRoutes());` で登録。
4. **フィーチャーテスト** (`apps/backend/tests/features/`)
   - access_token 成功、auth_token(admin) 成功、auth_token(user) 拒否、`x-event-id` 不一致拒否をカバー。
   - `app.request('/api/<resource>', { headers }, mockEnv)` で JWT_SECRET を渡す。
5. **単体テスト**
   - Validator / Repository / Use Case / Controller それぞれに happy + error ケースを追加。
6. **完了チェック**
   ```bash
   cd apps/backend
   bun run type-check
   bun run lint
   bun run test
   ```

## 提出物
- 変更対象ドメインの schema / migration / route / controller / use case / repository / validator
- Feature + unit tests 一式
- `contentAccessMiddleware` 適用済みの GET API
