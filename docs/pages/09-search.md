# 情報検索 `/search`

## 概要
- タイムテーブル、部屋割り、企画、販売物、その他情報を横断検索するページ。
- クライアント側で `q` クエリを URL に保持し、検索 API を呼び出す。

## アクセス制御
- API は `contentAccessMiddleware` を通過する必要がある。
- `admin`
  - URL の `event_id` で会期を選ぶ
- `user`
  - `access_token` の `event_id` を使用（URL の `event_id` は使わない）

## 画面構成
- キーワード入力と検索ボタン
- 状態表示
  - 検索中
  - エラー
  - 会期未選択
  - 0件
- 結果表示
  - カテゴリごとに件数とカードを表示

## API
### `GET /api/search?q=<keyword>`
- 必須ヘッダー: `x-event-id`
- レスポンス
```json
{
  "timetable": [],
  "rooms": [],
  "programs": [],
  "shopItems": [],
  "otherItems": []
}
```
- 失敗時
  - `400`: `q` または `x-event-id` のバリデーションエラー
  - `401`: 認証不備

## 検索対象フィールド
- timetable: `title`, `location`, `description`
- rooms: `buildingName`, `floor`, `roomName`, `preDayPurpose`, `dayPurpose`, `notes`, 担当部署名
- programs: `name`, `location`, `description`
- shopItems: `name`, `description`
- otherItems: `title`, `content`

## 実装メモ
- ページ: `apps/frontend/app/(authenticated)/search/page.tsx`
- バックエンド: `searchController.ts`, `SearchUseCase.ts`
- 検索語は前後空白を除去し、1文字以上必須

## テスト観点
- `q` 未指定で `400`
- `x-event-id` 不備で `400`
- 認証なしで `401`
- 複数カテゴリ同時ヒット時の表示
