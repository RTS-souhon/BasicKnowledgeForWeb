# 実装プラン: メール検証 + OTP認証 + 信頼デバイス + Email Worker

## ゴール

- ユーザー作成時にメールアドレスを検証し、未検証ユーザーの認証を制限する
- ログインを二段階化し、6桁OTPで本人確認する
- 信頼デバイスを 30 日保持し、再ログイン時の OTP を省略できるようにする
- メール送信責務を Email Worker に分離し、Backend Worker は Service Binding で呼び出す

## アーキテクチャ

### Worker 構成

- Frontend Worker (`apps/frontend`)
- Backend Worker (`apps/backend`)
- Email Worker (`apps/email-worker`)

### Binding 構成

- Frontend -> Backend: 既存 `BACKEND` service binding
- Backend -> Email Worker: 新規 `EMAIL_WORKER` service binding
- Email Worker -> Cloudflare Email: `send_email` binding

### 通信方針

- Backend から Email Worker へ `fetch()` で内部 API を呼ぶ
- Email Worker 側で内部認証ヘッダー (`x-internal-token`) を検証する
- 外部から Email Worker の内部 API を直接叩けないようにする

## 認証フロー

### 1. ユーザー登録 + メール検証

1. `POST /api/users` でユーザー作成（`email_verified_at = null`）
2. Backend が検証コード（6桁またはランダムトークン）を生成し、hash 保存
3. Backend が `EMAIL_WORKER` へ送信依頼
4. Email Worker が検証メール送信
5. ユーザーが `POST /api/auth/email/verify/confirm` でコード送信
6. 成功時に `users.email_verified_at` を更新

### 2. ログイン + OTP

1. `POST /api/auth/login` で email/password を検証
2. メール未検証なら 401（または 403）で拒否
3. 信頼デバイスが有効なら OTP をスキップし `auth_token` 発行
4. 信頼デバイスが無効なら OTP challenge を生成しメール送信
5. クライアントは `POST /api/auth/login/otp` に challenge と OTP を送信
6. 成功時に `auth_token` 発行、`trustDevice=true` なら `trusted_device` Cookie 発行

## データモデル

### users 追加カラム

- `email_verified_at timestamp null`

### email_verification_tokens

- `id uuid pk`
- `user_id uuid fk -> users.id`
- `token_hash text not null`
- `expires_at timestamp not null`
- `consumed_at timestamp null`
- `created_at timestamp default now`

### login_otp_challenges

- `id uuid pk`
- `user_id uuid fk -> users.id`
- `code_hash text not null`
- `expires_at timestamp not null`
- `attempts int not null default 0`
- `completed_at timestamp null`
- `created_at timestamp default now`

### trusted_devices

- `id uuid pk`
- `user_id uuid fk -> users.id`
- `device_token_hash text not null`
- `user_agent_hash text null`
- `ip_hash text null`
- `expires_at timestamp not null`
- `last_used_at timestamp default now`
- `created_at timestamp default now`

## API 追加/変更

### 追加

- `POST /api/auth/email/verify/request`
- `POST /api/auth/email/verify/confirm`
- `POST /api/auth/login/otp`

### 変更

- `POST /api/auth/login`
  - 変更前: 成功時に即 `auth_token` 発行
  - 変更後: OTP が必要な場合は challenge 発行レスポンスを返却

### Email Worker 内部 API

- `POST /internal/email/send`
  - payload: `template`, `to`, `params`
  - template: `email_verification` | `login_otp`

## セキュリティ要件

- OTP は 6 桁、10 分有効、60 秒再送制限、5 回失敗で無効化
- トークン/OTP は平文保存しない（hash 保存）
- `trusted_device` Cookie は `HttpOnly`, `Secure`, `SameSite=Lax`
- 信頼デバイス有効期限は 30 日
- 内部 API は service binding + 共有 secret で二重防御

## 実装ステップ

1. `apps/email-worker` を作成し、内部送信 API を実装
2. backend wrangler に `EMAIL_WORKER` service binding を追加
3. DB schema/migration を追加
4. backend repository/use-case/controller/routes を更新
5. frontend の register/login UI を更新
6. backend/frontend のテストを追加
7. dev 環境で e2e 相当の手動検証

## 完了定義

- 仕様どおりメール検証と OTP ログインが機能する
- 信頼デバイス 30 日が機能し、期限切れ後に OTP が再要求される
- backend/frontend の `type-check`, `lint`, `test` が成功する
- CI と Cloudflare dev デプロイで動作確認が取れる
