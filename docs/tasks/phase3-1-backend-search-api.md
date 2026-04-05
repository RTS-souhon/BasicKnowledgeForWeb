# Phase 3-1 Backend: `GET /api/search`

## 対象

- `docs/implementation-plan.md`
- `docs/pages/09-search.md`

## 目的

会期横断検索 API を追加し、タイムテーブルや部屋割りなど 5 ドメインの情報をキーワードでまとめて返せるようにする。

## 実装内容

1. `src/use-cases/search` に `ISearchUseCase` / `SearchUseCase` を追加し、5 リポジトリからの検索結果をまとめて返す
2. 各リポジトリ (`Timetable`, `Room`, `Program`, `ShopItem`, `OtherItem`) に `search(keyword, eventId)` を追加
3. `src/presentation/controllers/searchController.ts` と `routes/searchRoutes.ts` を追加し、`GET /api/search` を登録
4. `contentAccessMiddleware` を適用し、`q`（必須 1 文字以上）と `x-event-id` のバリデーションを行う
5. レスポンスは `{ timetable, rooms, programs, shopItems, otherItems }` の JSON を返す

## このフェーズでやらないこと

- POST/PUT/DELETE（Phase 4 で対応）
- Frontend `/search` ページ

## テスト

- UseCase: 5 リポジトリの結果がまとめて返却される
- Controller: `q` 未指定で 400 を返し、正常系で 200 と正しい JSON が返る
- Feature: `GET /api/search?q=foo` が `contentAccessMiddleware` 通過後に 5 カテゴリを返す

## 完了条件

- `GET /api/search` が会期スコープでの横断検索を提供し、Feature テストを含めたカバレッジが追加されている
