# Claude Code 向けタスク指示

Phase 1 の認証基盤に対して、追加の安全性確認とテスト拡充をお願いします。今回の前提は以下です。

- `JWT_SECRET` は backend / frontend の両 Worker に `wrangler secret put` で設定済み
- `wrangler.jsonc` では `secrets.required` で必須 secret を宣言済み
- Hono client は cookie ベース認証のため `credentials: 'include'` を付与済み

## Task 1: Frontend middleware のテスト追加

対象:

- `apps/frontend/middleware.ts`

やってほしいこと:

1. `auth_token` がある `admin` / `developer` は `/admin/*` とコンテンツページを通過できることをテスト
2. `access_token` がある一般ユーザーはコンテンツページを通過できることをテスト
3. 未認証時は `/access` または `/login` に正しくリダイレクトされることをテスト
4. `JWT_SECRET` が未設定、または不正署名トークンの場合に fail-closed になることをテスト

完了条件:

- `apps/frontend` の `bun run test` が通る
- middleware の主要分岐がテストでカバーされる

## Task 2: Backend の auth / access-code ルートテスト追加

対象:

- `apps/backend/src/presentation/routes/authRoutes.ts`
- `apps/backend/src/presentation/routes/accessCodeRoutes.ts`
- `apps/backend/src/presentation/middleware/authMiddleware.ts`
- `apps/backend/src/presentation/middleware/roleGuard.ts`

やってほしいこと:

1. `POST /api/auth/login` の正常系 / 認証失敗 / バリデーションエラーを feature test で追加
2. `GET/POST/DELETE /api/access-codes` の認可境界をテスト
3. `POST /api/access-codes/verify` の正常系 / 期限切れ / 不正コードをテスト
4. Cookie の有無と role に応じて 401 / 403 が正しく返ることを確認

完了条件:

- `apps/backend` の `bun run test` が通る
- 認証と認可の分岐が feature test で確認できる

## Task 3: 運用ドキュメントの明文化

対象候補:

- `apps/backend/README.md`
- `apps/frontend/README.md`
- 必要なら `docs/` 配下に運用メモを追加

やってほしいこと:

1. backend / frontend の両方に同じ `JWT_SECRET` を設定する必要があることを明記
2. ローカル開発では `.env` または `.dev.vars` を使う手順を整理
3. デプロイ前チェックとして `wrangler secret` の設定確認手順を追記

完了条件:

- 新しく入ったメンバーが README だけで secret 周りのセットアップを再現できる

## 実行時の注意

- 既存の `.codex/config.toml` の差分には触れない
- 変更後は対象 app ごとに `bun run type-check`, `bun run test`, `bun run lint` を実行
- コミットを切る場合は日本語の Conventional Commits を使う
