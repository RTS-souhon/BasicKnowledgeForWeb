---
name: auth-hardening-tests
description: docs/tasks/phase1-auth-hardening-for-claude.md の Task1/2/3 を実行して認証基盤を強化するためのコマンド。
---

# /auth-hardening-tests — 認証ハードニング

参照: `docs/tasks/phase1-auth-hardening-for-claude.md`

## スコープ
1. Frontend middleware (`apps/frontend/middleware.ts`) の Jest テスト
2. Backend `authRoutes` / `accessCodeRoutes` / `authMiddleware` / `roleGuard` の feature test
3. JWT secret 運用ドキュメント更新

## 手順
### 1. Frontend middleware テスト
- MSW + edge runtime 設定で middleware を実行し、以下を確認:
  - `auth_token` (admin/developer) → `/admin/*` やコンテンツページを通過
  - `access_token` (user) → コンテンツページを通過
  - 未認証 → `/access` or `/login` へリダイレクト
  - `JWT_SECRET` 未設定 or 署名不正 → fail closed
- `apps/frontend` で `bun run test` を通す。

### 2. Backend auth/access-code ルート
- `apps/backend/tests/features/` に以下を追加:
  - `POST /api/auth/login`: 正常 / 認証失敗 / バリデーション
  - `GET/POST/DELETE /api/access-codes`: admin/developer のみ許可、その他 403/401
  - `POST /api/access-codes/verify`: 正常 / 期限切れ / 不正コード返却
  - Cookie の有無と role に応じた `authMiddleware` / `roleGuard` の挙動
- 必要に応じて middleware unit test も追加。

### 3. ドキュメント
- `apps/backend/README.md`, `apps/frontend/README.md`, または `docs/` に以下を明記:
  - backend/frontend 両 Worker で同じ `JWT_SECRET` を設定すること
  - ローカル (`.env`, `.dev.vars`) と Cloudflare (`wrangler secret put`) の設定手順
  - デプロイ前チェックとして `wrangler secret` の確認方法

## 完了チェック
```bash
cd apps/frontend && bun run type-check && bun run lint && bun run test
cd apps/backend  && bun run type-check && bun run lint && bun run test
```

## 提出物
- Frontend middleware テスト
- Backend auth/access-code feature test
- JWT secret 手順を追加したドキュメント
