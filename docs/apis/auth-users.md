# Auth / Users API 仕様

このドキュメントは以下を対象にします。

- `/api/auth/*`
- `/api/users*`

## 共通

- 認証Cookie:
  - `auth_token`（ログインで発行）
- 認証失敗:
  - `401 Unauthorized`（`{ "error": "Unauthorized" }`）
- 権限不足:
  - `403 Forbidden`（`{ "error": "Forbidden" }`）

## Auth

### POST `/api/auth/login`

- 認証: 不要
- Body:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- 成功:
  - `200`
  - `auth_token` Cookie をセット
  - Body: `{ "message": "ログインしました" }`
- 主なエラー:
  - `400` バリデーションエラー
  - `401` 認証失敗

### POST `/api/auth/logout`

- 認証: 不要
- 成功:
  - `200`
  - `auth_token` Cookie を削除
  - Body: `{ "message": "ログアウトしました" }`

### GET `/api/auth/me`

- 認証: `auth_token` 必須
- 成功:
  - `200`
```json
{
  "id": "uuid",
  "name": "管理者",
  "email": "admin@example.com",
  "role": "admin"
}
```
- 主なエラー:
  - `401` Unauthorized

### PUT `/api/auth/password`

- 認証: `auth_token` 必須
- Body:
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password-123"
}
```
- 成功:
  - `200`
  - Body: `{ "message": "パスワードを変更しました" }`
- 主なエラー:
  - `400` バリデーションエラー / 現在パスワード不一致
  - `404` ユーザー未存在
  - `401` Unauthorized

## Users

### POST `/api/users`

- 認証: 不要
- Body:
```json
{
  "name": "一般ユーザー",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```
- 備考:
  - `role` 省略時は `user`
- 成功:
  - `201`
  - Body: `{ "user": { ... } }`
- 主なエラー:
  - `400` バリデーションエラー / メール重複など
  - `500` サーバーエラー

### GET `/api/users`

- 認証: `auth_token` 必須
- 権限: `admin` のみ
- 成功:
  - `200`
  - Body: `{ "users": [ ... ] }`
- 主なエラー:
  - `401` Unauthorized
  - `403` Forbidden
  - `500` サーバーエラー

### PUT `/api/users/:id/role`

- 認証: `auth_token` 必須
- 権限: `admin` のみ
- Path Param:
  - `id`: UUID
- Body:
```json
{
  "role": "admin"
}
```
- 備考:
  - `role` は `user` または `admin`
- 成功:
  - `200`
  - Body: `{ "message": "ロールを変更しました" }`
- 主なエラー:
  - `400` バリデーションエラー
  - `401` Unauthorized
  - `403` Forbidden
  - `404` ユーザー未存在
  - `500` サーバーエラー

## 実装参照

- Route:
  - `apps/backend/src/presentation/routes/authRoutes.ts`
  - `apps/backend/src/presentation/routes/userRoutes.ts`
- Controller:
  - `apps/backend/src/presentation/controllers/authController.ts`
  - `apps/backend/src/presentation/controllers/userController.ts`
- Validator:
  - `apps/backend/src/infrastructure/validators/authValidator.ts`
  - `apps/backend/src/infrastructure/validators/userValidator.ts`
  - `apps/backend/src/infrastructure/validators/userRoleValidator.ts`
