# Phase 4-5 Frontend: `/admin/access-code`

## 対象

- `docs/implementation-plan.md`
- `docs/pages/11-admin-access-code.md`

## 目的

admin/developer がアクセスコードの一覧・発行・削除を行える管理画面を実装する。

## 実装内容

1. `/admin/layout.tsx` で role チェックを行い、未認証または権限不足は `/login` にリダイレクト
2. `/admin/access-code/page.tsx` を Server Component で実装し、`GET /api/access-codes` を取得してテーブル表示する
3. 新規発行フォーム（コード / 会期名 / 有効期間）をモーダル or ドロワーで実装し、`POST /api/access-codes` を呼び出す
4. 各行に削除ボタンを置き、確認ダイアログ経由で `DELETE /api/access-codes/:id` をコールする
5. 成功時は `revalidatePath('/admin/access-code')` で再取得、エラー時はトースト

## このフェーズでやらないこと

- backend API 実装（Phase 1 で実装済み想定）
- 他ページの UI

## テスト

- 権限なしユーザーがアクセスするとリダイレクトされる
- 発行フォームがバリデーションエラーを表示する
- `fetch` モックで POST/DELETE が正しく呼ばれる

## 完了条件

- `/admin/access-code` で一覧・追加・削除が可能になり、page テスト or 主要コンポーネントテストが追加されている
