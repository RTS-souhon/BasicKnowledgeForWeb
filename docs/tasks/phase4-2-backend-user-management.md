# Phase 4-2 Backend: ユーザー管理 API

## 対象

- `docs/implementation-plan.md`
- `docs/pages/10-dashboard.md`

## 目的

admin がダッシュボードからユーザー一覧を参照し、ロール変更できるように `GET /api/users` と `PUT /api/users/:id/role` を提供する。

## 実装内容

1. `UserRepository` に `findAll`（role, email, createdAt を返却）と `updateRole` を追加し、`IUserRepository` を更新
2. `use-cases/user` に `GetUsersUseCase` / `UpdateUserRoleUseCase` を実装し、結果型を `{ success, data|error }` で統一
3. `userController` に一覧取得とロール更新のエンドポイントを追加し、`roleGuard(['admin'])` を適用
4. ルーティングで `/api/users` GET / PUT を登録し、PUT では body バリデーション（`role ∈ {user, admin}`）を行う
5. CockroachDB 側では `UPDATE users SET role = $1 WHERE id = $2 RETURNING ...` として結果を返却

## このフェーズでやらないこと

- パスワード変更 API（別タスク）
- フロントエンド UI（Phase 4-4）

## テスト

- Repository: `findAll` が `ORDER BY created_at DESC` で呼ばれる / `updateRole` が期待クエリを発行する
- UseCase: 正常・異常（対象なし）の分岐
- Controller: 認可エラーが 403、バリデーションエラーが 400、正常系が 200/204 を返す
- Feature: `/api/users` GET / PUT が JWT + role を要求する

## 完了条件

- 2 エンドポイントともテストが追加され、`docs/pages/10-dashboard.md` の API 設計に反映されている
