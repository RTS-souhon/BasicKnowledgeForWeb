# Phase 2 タスク一覧

Phase 2 は「閲覧用コンテンツ基盤」の実装フェーズです。  
今後の実装順序ルールに従い、**必ず backend → backend test → frontend → frontend test** の順で進めます。

## このフェーズで実装するもの

- 各コンテンツテーブルと GET API
- 認証済みユーザー向けの共通レイアウト
- `/` `/timetable` `/rooms` `/events` `/shop` `/others` の閲覧ページ

## このフェーズで実装しないもの

- 各コンテンツの POST / PUT / DELETE API
- admin 向けの編集 UI
- `/dashboard` `/departments` と `/admin/access-codes`
- `/search`

編集 UI は docs 各ページに将来仕様として記載されていますが、**Phase 2 では閲覧 UI のみ** 実装します。  
編集機能は Phase 4 で着手します。

## 実装順序

1. [Phase 2-1 Backend: コンテンツスキーマと GET API](./phase2-1-backend-content-get-apis.md)
2. [Phase 2-2 Frontend: `(authenticated)` layout とナビゲーション](./phase2-2-frontend-authenticated-layout.md)
3. [Phase 2-3 Frontend: TOPページ `/`](./phase2-3-frontend-home-page.md)
4. [Phase 2-4 Frontend: `/timetable`](./phase2-4-frontend-timetable-page.md)
5. [Phase 2-5 Frontend: `/rooms`](./phase2-5-frontend-rooms-page.md)
6. [Phase 2-6 Frontend: `/events`](./phase2-6-frontend-events-page.md)
7. [Phase 2-7 Frontend: `/shop`](./phase2-7-frontend-shop-page.md)
8. [Phase 2-8 Frontend: `/others`](./phase2-8-frontend-others-page.md)

## 共通前提

- 仕様の正は `docs/pages/*.md` と `docs/implementation-plan.md`
- `event_id` は backend への GET リクエスト時に header で渡す
  - header 名は `x-event-id`
  - user: `access_token` の `event_id` を使って header を付与する
  - admin: frontend 側で選択中の会期 ID を使って header を付与する
- frontend は backend の GET API とテストが揃ってから着手する
- 各タスク完了時に対象 app で `type-check`, `test`, `lint` を実行する
