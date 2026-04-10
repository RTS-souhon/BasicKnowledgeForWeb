# ユーザーダッシュボード `/dashboard`

## 概要

ログイン済みユーザーの自分のプロフィール確認とパスワード変更。
Admin/Developer の場合はアクセスコード設定へのリンクも表示する。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| auth_token 有効 | 表示（全ロール） |
| それ以外 | `/login` へリダイレクト |

---

## 画面構成

### デスクトップ

```
┌──────────────────────────────────────┐
│  ダッシュボード                        │
│                                      │
│  ── プロフィール ──                    │
│  名前:    山田太郎                     │
│  メール:  user@example.com            │
│  ロール:  スタッフ                     │  ← user → "スタッフ"
│                                      │     admin → "管理者"
│  ── パスワード変更 ──                  │
│  現在のパスワード [          ]         │
│  新しいパスワード [          ]         │
│  確認            [          ]         │
│  [変更する]                           │
│                                      │
│  ── ユーザー管理（admin のみ）──  │
│  名前          メール               ロール    操作  │
│  ─────────────────────────────────────────       │
│  山田太郎  user@example.com   スタッフ  [変更]     │
│  管理者A   admin@example.com  管理者    [変更]     │
│  ...                                             │
│                                                  │
│  ── 管理メニュー（admin のみ）──  │
│  [アクセスコード管理 →]                │
└──────────────────────────────────────┘
```

### スマートフォン

```
┌──────────────────────┐
│  ダッシュボード        │
│                      │
│  ── プロフィール ──   │
│  名前:  山田太郎      │
│  メール:              │
│  user@example.com    │  ← 長いメールも折り返し
│  ロール: スタッフ      │
│                      │
│  ── パスワード変更 ── │
│  現在のパスワード      │
│  [                 ] │  ← フルワイド入力
│  新しいパスワード      │
│  [                 ] │
│  確認                 │
│  [                 ] │
│  [     変更する     ] │
│                      │
│  ── ユーザー管理 ──   │  ← admin のみ
│  ┌──────────────────┐│
│  │ 山田太郎          ││
│  │ user@example.com  ││
│  │ スタッフ   [変更] ││  ← ロールと変更ボタンを同行
│  └──────────────────┘│
│  ...                 │
│                      │
│  [アクセスコード管理 →]│
└──────────────────────┘
```

**スマートフォン固有の要件:**
- フォーム入力欄はすべてフルワイド（`w-full`）
- ユーザー管理の4列テーブルはカード形式に変換（名前・メール・ロール＋変更ボタンを縦積み）
- メールアドレスが長い場合は折り返し表示（`break-all`）

---

## データ

- `/api/auth/me` から取得: `{ id, name, email, role }`

---

## API

### GET `/api/auth/me`

```json
{ "id": "...", "name": "山田太郎", "email": "user@example.com", "role": "user" }
```

### GET `/api/users` （admin）

```json
{ "users": [ { "id": "...", "name": "...", "email": "...", "role": "user" | "admin" } ] }
```

### PUT `/api/users/:id/role` （admin）

**リクエスト**
```json
{ "role": "admin" }
```

**レスポンス**
```
200 { "message": "ロールを変更しました" }
400 { "error": "バリデーションエラー" }
404 { "error": "ユーザーが見つかりません" }
```

### PUT `/api/auth/password`

**リクエスト**
```json
{
    "currentPassword": "oldpass",
    "newPassword": "newpass123"
}
```

**レスポンス**
```
200 { "message": "パスワードを変更しました" }
400 { "error": "現在のパスワードが正しくありません" }
400 { "error": "バリデーションエラー" }
```

---

## フロントエンド実装

- `page.tsx`: Server Component で `/api/auth/me` と `/api/users`（admin の場合のみ）を fetch
- パスワード変更フォーム: Client Component
  - `react-hook-form` + `changePasswordSchema`
  - 成功時: 成功メッセージ表示 + フォームリセット
- admin 判定: Server Component 側でロール確認 → ユーザー管理・管理メニューの表示切り替え
- ロール変更 UI: Client Component
  - 各ユーザー行に [変更] ボタン → ドロップダウンで `user` / `admin` を選択
  - `PUT /api/users/:id/role` 送信 → 一覧を更新

---

## バックエンド実装

### 新規エンドポイント

```
PUT /api/auth/password   → authController.ts に追加
GET /api/users           → userController.ts（新規）
PUT /api/users/:id/role  → userController.ts（新規）
```

### ChangePasswordUseCase

1. `findById` でユーザー取得
2. `bcrypt.compare(currentPassword, user.password)` で検証
3. 失敗 → 400 エラー
4. `bcrypt.hash(newPassword)` で新パスワードをハッシュ化
5. `userRepository.updatePassword(userId, hashedPassword)` で更新

### GetUsersUseCase

- `userRepository.findAll()` でユーザー一覧取得（password フィールドを除外して返す）

### UpdateUserRoleUseCase

1. `userRepository.findById(id)` でユーザー取得
2. 存在しない場合 → 404 エラー
3. `userRepository.updateRole(id, role)` でロール更新

### userRoleValidator.ts

```typescript
const updateUserRoleSchema = z.object({
    role: z.enum(['user', 'admin']),
})
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | プロフィール情報（名前・メール・ロール）が表示されること |
| 2 | user ロール時にユーザー管理・管理メニューが表示されないこと |
| 3 | admin ロール時にユーザー管理・管理メニューが表示されること |
| 4 | パスワード変更フォームで正常に変更できること |
| 5 | 現在のパスワードが誤っている場合エラーが表示されること |
| 6 | 新しいパスワードが短すぎる場合バリデーションエラーが表示されること |
| 7 | ユーザー一覧が表示されること（admin） |
| 8 | ロール変更ドロップダウンで変更が送信されること |
| 9 | ロール変更後に一覧が更新されること |
