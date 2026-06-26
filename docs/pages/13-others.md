# その他の情報 `/others`

## 概要
- 会期ごとの自由記述情報（注意事項・連絡事項など）を表示・管理するページ。
- `admin` は編集UI、`user` は閲覧UIを利用する。

## アクセス制御
- 閲覧: `contentAccessMiddleware`
- 編集: `contentEditMiddleware` + `roleGuard(['admin'])`
- 編集 API は `auth_token(role=admin)` と `x-event-id` が必須

## 画面構成
- `user`
  - `displayOrder` 昇順で一覧表示
  - タイトル、本文、画像を表示
- `admin`
  - `OtherItemAdminPanel` で一覧・作成・更新・削除
  - 画像アップロード機能あり

## データ構造
```ts
type OtherItem = {
  id: string;
  eventId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  displayOrder: number;
  createdBy: string;
}
```

## API
### `GET /api/others`
- ヘッダー: `x-event-id`
- レスポンス: `{ "items": OtherItem[] }`

### `POST /api/others`（admin）
```json
{
  "event_id": "uuid",
  "title": "お知らせ",
  "content": "本文",
  "display_order": 1,
  "image_key": "others/<event_id>/<uuid>.webp"
}
```
- `createdBy` はサーバー側で `auth_token` から補完

### `PUT /api/others/:id`（admin）
- 部分更新可

### `DELETE /api/others/:id`（admin）
- レスポンス: `{ "id": "uuid" }`

### `POST /api/others/upload`（admin）
- `multipart/form-data` で `file` を送信
- レスポンス: `{ "imageKey": "others/<event_id>/<uuid>.ext" }`

## 実装メモ
- ページ: `apps/frontend/app/(authenticated)/others/page.tsx`
- Action: `apps/frontend/app/actions/others.ts`
- バックエンド: `otherItemController.ts`, `otherItemRoutes.ts`

## テスト観点
- `display_order` の昇順表示
- 画像キーのプレフィックス検証（`others/<event_id>/`）
- `admin` と `user` の表示分岐
- 会期未選択時の表示
