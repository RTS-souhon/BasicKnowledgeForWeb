# ログイン画面 `/login`

## 概要

メールアドレスとパスワードでログインし、`auth_token` Cookie を取得する。
成功後は `/dashboard` へリダイレクト。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| 未認証 | 表示 |
| 認証済み（auth_token 有効） | `/dashboard` へリダイレクト |

---

## 画面構成

単一カラムのフォームのため、デスクトップ・スマートフォンで共通のレイアウトを使用する。

```
┌─────────────────────────────┐
│         ログイン             │
│  メールアドレス [          ] │
│  パスワード     [          ] │
│  [エラーメッセージ（任意）]   │
│         [ログインする]        │
│  アカウント未登録？ /register │
└─────────────────────────────┘
```

**スマートフォン固有の要件:**
- フォームカードは画面中央に配置し、左右に `px-4` 程度のパディングを確保
- 入力欄・ボタンはフルワイド（`w-full`）
- メールフィールドに `inputMode="email"` を付与（モバイルキーボード最適化）

---

## フォームバリデーション（クライアント側）

| フィールド | ルール |
|---|---|
| email | 必須・メール形式 |
| password | 必須 |

---

## API

### `POST /api/auth/login`

**リクエスト**
```json
{ "email": "user@example.com", "password": "password123" }
```

**レスポンス**
```
201 Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Strict
{ "user": { "id", "name", "email", "role" } }

400 { "error": "メールアドレスまたはパスワードが正しくありません" }
```

### JWT payload

```json
{ "sub": "<user_id>", "role": "user|admin", "exp": <timestamp> }
```

Cookie 有効期限: 24 時間

---

## フロントエンド実装

- `'use client'` コンポーネント
- `react-hook-form` + `zodResolver`
- バリデーションスキーマは `loginSchema`（フロントエンド独自定義）
- 成功時: `router.push('/dashboard')`
- 400 エラー時: フォーム上部にグローバルエラー表示

---

## バックエンド実装

### 新規ファイル

```
src/presentation/
  controllers/authController.ts
  routes/authRoutes.ts
  middleware/
    authMiddleware.ts    ← Cookie の JWT を検証し c.set('user', payload)
    roleGuard.ts         ← role: ['admin'] チェック
```

### authController.ts の責務

1. `AuthenticateUserUseCase.execute({ email, password })` を呼ぶ
2. 成功時: `hono/jwt` で JWT を署名し Cookie にセット
3. 失敗時: 400 エラーを返す

> `AuthenticateUserUseCase` は既に実装済み。JWT 発行と Cookie セットのみ追加する。

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | フォームフィールドが表示されること |
| 2 | 空送信でバリデーションエラーが表示されること |
| 3 | 正しい認証情報で成功メッセージ/リダイレクトされること |
| 4 | 誤った認証情報でエラーメッセージが表示されること |
