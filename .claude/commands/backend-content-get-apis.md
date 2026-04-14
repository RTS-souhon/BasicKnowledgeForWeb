---
name: backend-content-get-apis
description: Phase2-1 の timetable/rooms/programs/shop-items/others GET API をスキーマ追加から middleware・テストまで実装するためのチェックリスト。
---

# /backend-content-get-apis — Phase2-1 Backend GET API

参照: `docs/tasks/phase2-1-backend-content-get-apis.md`

## ゴール
- `apps/backend/src/db/schema.ts` に各テーブルを追加し、Drizzle Migration を安全に適用
- Validator / Repository / UseCase / Controller / Routes を全ドメイン分そろえる
- `contentAccessMiddleware` + `x-event-id` header を必須化
- Feature/Unit テストで access_token/auth_token の動作と並び順を検証

## 手順
1. **Schema**
   - 追加テーブル: `timetable_items`, `rooms`, `programs`, `shop_items`, `other_items`, `departments`, `user_departments`。
   - 全テーブルの `event_id` は `access_codes.id` を `ON DELETE RESTRICT` で参照。
   - `rooms` の部署 FK は `(event_id, manager_id)` → `departments(event_id, id)` にする。
   - `departments` へ `(event_id, id)` の UNIQUE INDEX を追加。
2. **Migration**
   ```bash
   cd apps/backend
   bun run db:generate
   ```
   - `migration.sql` で `CREATE UNIQUE INDEX IF NOT EXISTS ...` が `ADD CONSTRAINT ... FOREIGN KEY` より前に来ているか確認。逆なら並べ替える。
   - `bun run db:migrate` を実行。
3. **Validator / DTO**
   - `x-event-id` header を Zod で必須化。
   - レスポンス DTO を docs に合わせて定義。
4. **Repository**
   - 並び順: timetable/programs=`start_time` 昇順、rooms=`building_name`→`floor`→`room_name`、shop-items=名前昇順、others=`display_order`。
   - `rooms` は `alias` を用いて部署名を JOIN 取得。
5. **Use Case & Controller**
   - 戻り値は `{ success: true; data } | { success: false; error }`。
   - `x-event-id` 不足時は `400`、use case 失敗時は `500`。
6. **Routes + Middleware**
   - `contentAccessMiddleware` を各 GET ルートに適用。
   - Routes は DI 可能な `repositoryFactory` パターンで作成し、`src/index.ts` に `app.route('/api', createXxxRoutes());` を追加。
7. **テスト**
   - Feature: access_token 成功 / auth_token(admin) 成功 / auth_token(user) 401 / `x-event-id` 不一致 401。
   - Unit: Validator / Repository / Use Case / Controller を層ごとに追加。
8. **最終チェック**
   ```bash
   bun run type-check
   bun run lint
   bun run test
   ```

## 完了条件
- 5つの GET API + docs どおりの整列順序 + middleware を一貫して実装
- Feature/Unit テストが全て PASS
