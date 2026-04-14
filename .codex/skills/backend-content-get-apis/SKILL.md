---
name: backend-content-get-apis
description: Phase2-1 の backend GET API を追加するときに使う。docs/tasks/phase2-1-backend-content-get-apis.md をもとにスキーマ追加から middleware・テストまでの順番を指示する。
---

# Phase2-1 Backend GET API ガイド

参照: `docs/tasks/phase2-1-backend-content-get-apis.md`

## 前提
- 追加対象: timetable / rooms / programs / shop-items / others の閲覧用 API
- `x-event-id` header を必須とし、`contentAccessMiddleware` を全ルートに適用
- CockroachDB の複合FK順序制約に注意

## 手順
1. **Schema 拡張** (`apps/backend/src/db/schema.ts`)
   - 指定テーブル・列を追加、`event_id` は `access_codes.id` を参照 (`ON DELETE RESTRICT`).
   - 部屋テーブルの部署 FK は `(event_id, manager_id)` → `departments(event_id, id)` の複合制約。
   - `departments` に `(event_id, id)` の UNIQUE INDEX を追加。
2. **Migration**
   - `bun run db:generate` で生成後、`CREATE UNIQUE INDEX IF NOT EXISTS ...` が `ADD CONSTRAINT ... FOREIGN KEY` より先になるよう並び替え。
   - `bun run db:migrate` で適用。
3. **レイヤー実装**
   - Validator: `x-event-id` ヘッダーとリクエスト形状を Zod で定義。
   - Repository: 並び順（例: timetable/programs= `start_time` 昇順、rooms= building→floor→room、shop=名前昇順、others=display_order昇順）を守り、rooms では部署名を LEFT/INNER JOIN で解決。
   - Use Case: `{ success: true; data } | { success: false; error }` 遵守。
   - Controller: `x-event-id` 未指定は 400、use case 失敗は 500。リクエスト→ヘッダー検証→ use case 実行。
   - Routes: `contentAccessMiddleware` を挟み、`createXxxRoutes(repositoryFactory?)` パターンで DI 可。
   - `src/index.ts` に各 routes を `app.route('/api', createXxxRoutes());` で登録。
4. **Feature Tests** (`apps/backend/tests/features/`)
   - access_token 成功、auth_token(admin) 成功、auth_token(user) 拒否、`x-event-id` 不一致拒否を全 API でカバー。
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
- スキーマ + migration + 5ドメインの route/controller/use case/repository/validator
- Feature + unit tests 一式
- `contentAccessMiddleware` 適用済みの `/api/timetable|rooms|programs|shop-items|others`
