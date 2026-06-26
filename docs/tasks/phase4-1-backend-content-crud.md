# Phase 4-1 Backend: コンテンツ編集 API (POST/PUT/DELETE)

## 対象

- `docs/implementation-plan.md`
- `docs/pages/05-timetable.md`
- `docs/pages/06-rooms.md`
- `docs/pages/07-events.md`
- `docs/pages/08-shop.md`
- `docs/pages/13-others.md`

## 目的

タイムテーブル / 部屋割り / 企画 / 販売物 / その他の各ドメインに対して、admin がコンテンツを追加・更新・削除できる API を提供する。

## 実装内容

1. 各ドメインの validator を拡張し、POST/PUT/DELETE 用の入力スキーマを追加する
2. 各 repository に `create`, `update`, `delete` メソッドを追加し、use-case 層（Create/Update/Delete）を実装する
3. 既存 controller / route に POST/PUT/DELETE ハンドラを追加し、`roleGuard(['admin'])` を適用する
4. contentAccessMiddleware とは別に編集専用 middleware で auth_token + role を検証し、`event_id` と `x-event-id` の整合性を必ずチェックする
5. すべてのミューテーション API は `{ success: true, data }` / `{ success: false, error }` の結果型を返す
6. CockroachDB での更新/削除は `RETURNING *` を使って結果を返却し、ソフトデリートは未対応で OK（別タスクで導入予定）
7. 販売物 (`shop_items`) ドメインでは商品画像を Cloudflare R2 に保存することを前提にし、`image_key`（R2 オブジェクトパス）と `image_url`（CDN 経由の参照 URL）を validator / repository / use-case / controller すべてで必須フィールドとして扱う

### 画像/R2 連携の詳細

- 環境変数で R2 バケット（例: `SHOP_ITEM_ASSET_BUCKET`）を受け取り、`POST /api/shop-items/upload`（admin 限定）でファイルを受け取り、`image_key` を返す
- 企画/その他も同様に `POST /api/programs/upload` / `POST /api/others/upload` を追加する
- `CreateShopItemUseCase` / `UpdateShopItemUseCase` では、リクエストに含まれる `image_key` が自分のバケットプレフィックス（`shop-items/<event_id>/...` など）に一致するかをチェックし、許可されていないキーは拒否する
- `GetShopItemsUseCase` / controller では `image_url` を API レスポンスに含め、フロントエンドが常に画像を表示できるようにする
- バケット内の実体削除はこのフェーズでは任意（再アップロード時に同じキーを上書きする運用で可）だが、後続タスクでクリーンアップを検討する

## このフェーズでやらないこと

- Search API（Phase 3）
- UI 実装（Phase 4-3）

## テスト

- UseCase: 正常系で repository が正しく呼ばれる / エラー伝搬
- Controller: 不正ロールが 403、バリデーション NG が 400、正常系が 201/200/204
- Feature: `/api/<domain>` の POST/PUT/DELETE が JWT を要求し、DB モックで期待レスポンスになる

## 完了条件

- 5 ドメインすべてで POST/PUT/DELETE が動作し、use-case・controller テストが追加されている
- API ドキュメント（docs/pages/*）にエンドポイント仕様が反映されている
