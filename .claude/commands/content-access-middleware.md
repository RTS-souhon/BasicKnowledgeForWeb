---
name: content-access-middleware
description: `contentAccessMiddleware` を実装・テストし、閲覧系 API の access_token/auth_token 条件を確認するためのコマンド。
---

# /content-access-middleware — コンテンツアクセス制御

参照: `AGENTS.md` の「Content Access Middleware」「Roles & RBAC」節

## 目的
- `access_token` か `auth_token(admin|developer)` のみコンテンツ GET API を通過させる
- `x-event-id` ヘッダーと JWT の照合を強制

## 実装手順
1. **Middleware 本体** (`apps/backend/src/presentation/middleware/contentAccessMiddleware.ts`)
   - `x-event-id` が無ければ `400`。
   - `access_token` を優先検証し、署名が有効で `payload.event_id === header` なら通過。
   - `auth_token` は `role in {admin, developer}` のみ許可。
   - どちらも無効/未設定なら `401`。
2. **Context 共有**
   - `c.set('eventId', payload.event_id)` や `c.set('userRole', payload.role)` で downstream が参照できるようにする。
3. **ルート適用**
   - `GET /api/timetable|rooms|programs|shop-items|others` 全てに middleware を追加。
   - 読み取り用途では `authMiddleware` の代わりに本 middleware を利用。
4. **テスト**
   - Unit (`tests/presentation/middleware/contentAccessMiddleware.test.ts`):
     - access_token 正常 / event_id 不一致 / 署名不正 / なし
     - auth_token admin/developer OK、user NG
   - Feature: 各 GET API で access_token(成功)、auth_token(admin 成功)、auth_token(user 401)、`x-event-id` 不一致 401 を確認。
5. **完了チェック**
   ```bash
   cd apps/backend
   bun run type-check
   bun run lint
   bun run test
   ```

## 提出物
- middleware 実装 + ユニットテスト
- Feature テストでの 200/401 カバレッジ
- 必要に応じて docs/AGENTS.md 更新
