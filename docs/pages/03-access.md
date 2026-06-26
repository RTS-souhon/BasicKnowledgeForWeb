# アクセスコード入力画面 `/access`

## 概要
- 一般ユーザーが会期アクセス用コードを入力する画面。
- 成功時に `access_token` Cookie を受け取り、`/` へ遷移する。

## アクセス制御
- 未ログインでも表示可能。
- 管理者ログイン導線として `/login` へのリンクを表示。

## 画面構成
- 入力項目
  - アクセスコード
- 表示要素
  - 入力バリデーションエラー
  - サーバーエラー
  - `/login` への導線

## フォームバリデーション
- `code`: 1文字以上必須

## 利用 API
### `POST /api/access-codes/verify`
- リクエスト
```json
{
  "code": "SUMMER2025"
}
```
- 成功時
  - `200 OK`
  - `Set-Cookie: access_token=...`
  - レスポンス: `{ "message": "アクセスコードを確認しました" }`
- 失敗時
  - `400`: バリデーションエラー
  - `401`: コード不正 / 有効期限外

## JWT ペイロード（`access_token`）
```json
{
  "event_id": "access-code-id(uuid)",
  "exp": 1700000000
}
```

## 実装メモ
- フロント: `apps/frontend/app/access/page.tsx`
- バックエンド: `accessCodeController.verifyAccessCode` + `VerifyAccessCodeUseCase`
- `exp` はアクセスコードの `valid_to` を使用

## テスト観点
- 正しいコードで `200` + Cookie 設定
- 不正コードで `401`
- 期限切れコードで `401`
- 入力不足で `400`
