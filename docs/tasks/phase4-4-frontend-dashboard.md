# Phase 4-4 Frontend: `/dashboard`

## 対象

- `docs/implementation-plan.md`
- `docs/pages/10-dashboard.md`

## 目的

ユーザー認証済みセクションとして `/dashboard` を実装し、プロファイル表示・パスワード変更・ユーザー一覧/ロール変更 UI を提供する。

## 実装内容

1. `/dashboard/page.tsx` を Server Component で実装し、`resolveAuth` で auth_token を確認。未認証なら `/login` へリダイレクト
2. プロフィールカードに `name/email/role` を表示し、パスワード変更フォーム（旧 PW + 新 PW + 確認）を Client Component で実装、`/api/auth/password` (予定 API) を叩く
3. admin の場合のみユーザー一覧テーブルを表示し、`GET /api/users` で取得したデータをロール変更ドロップダウンと共に描画
4. ロール更新は `PUT /api/users/:id/role` を呼び出し、成功後にローカル state を更新。エラー時はトースト
5. UI はカード + タブ構成にし、モバイルでは縦積みに崩さないよう `Accordion` 的挙動を追加

## このフェーズでやらないこと

- backend API 追加（Phase 4-2）
- `/admin/access-code` の UI（Phase 4-5）

## テスト

- 未認証時にリダイレクトされる（middleware + page test）
- admin には一覧が表示され、user ロールには表示されない
- ロール変更ボタンが `fetch` を正しい payload で呼ぶことをモックで確認
- パスワードフォームのバリデーション（必須 / 確認一致）

## 完了条件

- `/dashboard` で想定 UI が動作し、主要な挙動を検証する page / component テストが追加されている
