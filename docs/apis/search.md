# Search API 仕様

このドキュメントは `/api/search` を対象にします。

## GET `/api/search`

- 認証: `contentAccessMiddleware`
- 必須ヘッダー:
  - `x-event-id: <uuid>`
- Query:
  - `q`（必須、trim後1文字以上）

### リクエスト例

`GET /api/search?q=設営`

### 成功レスポンス

- ステータス: `200`
- Body:
```json
{
  "timetable": [],
  "rooms": [],
  "programs": [],
  "shopItems": [],
  "otherItems": []
}
```

各配列の要素型:

- `timetable`: `TimetableItem[]`
- `rooms`: `RoomWithDepartments[]`
- `programs`: `Program[]`
- `shopItems`: `ShopItem[]`
- `otherItems`: `OtherItem[]`

### 主なエラー

- `400` バリデーションエラー（`x-event-id` 不正 / `q` 未指定・空文字）
- `401` Unauthorized
- `500` サーバーエラー

## 実装参照

- Route: `apps/backend/src/presentation/routes/searchRoutes.ts`
- Controller: `apps/backend/src/presentation/controllers/searchController.ts`
- Validator:
  - `apps/backend/src/infrastructure/validators/searchValidator.ts`
  - `apps/backend/src/infrastructure/validators/eventIdValidator.ts`
