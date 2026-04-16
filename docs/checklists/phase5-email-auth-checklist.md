# Phase 5 実装チェックリスト

## 1. Infrastructure / Cloudflare

- [ ] `apps/email-worker` が作成されている
- [ ] Email Worker に `send_email` binding が設定されている
- [ ] `apps/backend/wrangler.jsonc` に `EMAIL_WORKER` service binding がある
- [ ] dev/prod で service 名が環境別に設定されている
- [ ] 内部通信用 secret が backend/email-worker 両方に設定されている
- [ ] Email Routing の対象ドメインと Worker 設定が有効化されている

## 2. Database

- [ ] `users.email_verified_at` が追加されている
- [ ] `email_verification_tokens` テーブルが追加されている
- [ ] `login_otp_challenges` テーブルが追加されている
- [ ] `trusted_devices` テーブルが追加されている
- [ ] Drizzle migration が生成済み
- [ ] CockroachDB で migration 適用成功

## 3. Backend API

- [ ] ユーザー登録でメール検証トークンが発行される
- [ ] `POST /api/auth/email/verify/request` が実装されている
- [ ] `POST /api/auth/email/verify/confirm` が実装されている
- [ ] `POST /api/auth/login` が OTP challenge 方式に変更されている
- [ ] `POST /api/auth/login/otp` が実装されている
- [ ] `trustDevice` 指定時に 30 日有効 Cookie が発行される
- [ ] 信頼デバイス有効時は OTP をスキップできる

## 4. Email Worker

- [ ] `POST /internal/email/send` が実装されている
- [ ] `email_verification` テンプレートが実装されている
- [ ] `login_otp` テンプレートが実装されている
- [ ] 内部認証ヘッダーの検証がある
- [ ] 送信失敗時にログとエラーレスポンスが返る

## 5. Frontend

- [ ] register 後のメール検証コード入力 UI がある
- [ ] login が 2 ステップ（password -> otp）になっている
- [ ] 「このデバイスを信頼する（30日）」UI がある
- [ ] OTP 再送クールダウン（60秒）が実装されている
- [ ] API エラー時にユーザー向けメッセージが表示される

## 6. Test / Quality

- [ ] backend `bun run type-check` 成功
- [ ] backend `bun run lint` 成功
- [ ] backend `bun run test` 成功
- [ ] backend Feature Test に `POST /api/auth/email/verify/request` の正常系/異常系がある
- [ ] backend Feature Test に `POST /api/auth/email/verify/confirm` の正常系/期限切れ/不正コードがある
- [ ] backend Feature Test に `POST /api/auth/login` と `POST /api/auth/login/otp` の分岐（OTP必須/スキップ）がある
- [ ] backend Test に OTP の試行回数超過（5回）と再送クールダウン（60秒）がある
- [ ] email-worker `bun run type-check` 成功
- [ ] email-worker `bun run lint` 成功
- [ ] email-worker `bun run test` 成功
- [ ] email-worker Test に内部認証ヘッダー不正時の 401 がある
- [ ] email-worker Test にテンプレート生成（`email_verification` / `login_otp`）の検証がある
- [ ] email-worker Test に送信失敗時ハンドリング（エラー応答/ログ）がある
- [ ] frontend `bun run type-check` 成功
- [ ] frontend `bun run lint` 成功
- [ ] frontend `bun run test` 成功
- [ ] frontend Test に login 2ステップ（password -> otp）とエラー表示がある
- [ ] frontend Test に OTP 再送クールダウン（60秒）の検証がある
- [ ] frontend Test に信頼デバイス 30 日（有効/期限切れ）の検証がある
- [ ] backend-email-worker 間の内部 API 呼び出しをモックした連携テストがある
- [ ] PR CI（`pull-request.yml`）で backend/frontend/email-worker の lint/type-check/test が全て成功する

## 7. Release Readiness

- [ ] PR タイトルと本文が日本語で作成されている
- [ ] 変更内容が Conventional Commits で分割されている
- [ ] Cloudflare dev 環境で実機確認済み
- [ ] 本番反映手順とロールバック手順が共有されている
