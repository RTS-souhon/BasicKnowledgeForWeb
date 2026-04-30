# ユーザーダッシュボード `/dashboard`

## 概要
- ログインユーザーのプロフィール表示と各種設定画面。
- `admin` のみユーザー権限管理と管理メニューを利用できる。

## アクセス制御
- `auth_token` がない場合は `/login` にリダイレクト。
- `role=admin` のときのみ以下を表示:
  - ユーザー権限変更パネル
  - 管理メニュー（アクセスコード管理、部署管理）

## 画面構成
- プロフィール
  - 名前
  - メール
  - ロール
- パスワード変更フォーム
- （adminのみ）ユーザー管理
- （adminのみ）管理メニューリンク

## 利用 API
### `GET /api/auth/me`
- 認証ユーザー情報取得

### `PUT /api/auth/password`
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```
- `newPassword` は 8文字以上

### `GET /api/users`（admin）
- 全ユーザー一覧を取得

### `PUT /api/users/:id/role`（admin）
```json
{
  "role": "admin"
}
```
- `role` は `user | admin`

## 実装メモ
- ページ: `apps/frontend/app/(authenticated)/dashboard/page.tsx`
- 関連コンポーネント
  - `PasswordChangeForm.tsx`
  - `UserRolePanel.tsx`
- Action: `apps/frontend/app/actions/dashboard.ts`

## テスト観点
- 未ログイン時リダイレクト
- パスワード変更の成功/失敗
- admin でのみユーザー管理が表示される
- ロール変更後の一覧再取得
