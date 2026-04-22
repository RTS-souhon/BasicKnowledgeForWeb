# アクセスコード設定画面 `/admin/access-codes`

## 概要
- 会期アクセスコードを管理する管理者専用ページ。
- コードの新規作成と削除を行う。

## アクセス制御
- `apps/frontend/app/(authenticated)/admin/layout.tsx` で `admin` 限定。
- `auth_token` がない、または `role !== admin` の場合は `/login` へリダイレクト。

## 画面構成
- 新規コード生成フォーム
  - イベント名
  - コード（自動生成可）
  - 有効開始日
  - 有効終了日
- コード一覧
  - イベント名
  - コード
  - 有効期間
  - ステータス（準備中/有効中/終了）
  - 削除操作

## API
### `GET /api/access-codes`
- `auth_token(role=admin)` 必須
- レスポンス: `{ "codes": AccessCode[] }`

### `POST /api/access-codes`（admin）
```json
{
  "code": "SUMMER2026",
  "eventName": "2026夏イベント",
  "validFrom": "2026-05-01T00:00:00.000Z",
  "validTo": "2026-05-31T23:59:59.999Z"
}
```
- `createdBy` はサーバー側で `auth_token` から補完

### `DELETE /api/access-codes/:id`（admin）
- レスポンス: `{ "message": "削除しました" }`

## 関連 API
### `POST /api/access-codes/verify`
- `user` 向け `/access` 画面で利用
- 成功時 `access_token` を発行

## 実装メモ
- ページ: `apps/frontend/app/(authenticated)/admin/access-codes/page.tsx`
- UI: `AccessCodeAdminPanel.tsx`
- Action: `apps/frontend/app/actions/access-codes.ts`

## テスト観点
- 重複コード作成エラー
- 有効期限不正（`validTo <= validFrom`）
- 削除後の一覧更新
- 非 admin のアクセス拒否
