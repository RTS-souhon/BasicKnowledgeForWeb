# Phase 2-4 Frontend: `/timetable`

## 対象

- `docs/pages/05-timetable.md`

## 目的

イベント会期のタイムテーブルを閲覧できるページを実装する。  
Phase 2 では閲覧専用とし、編集 UI は入れない。

## 実装内容

1. Server Component として `/timetable` を実装する
2. backend の `GET /api/timetable` からデータ取得する
3. `event_id` を解決し、backend fetch に `x-event-id` header を付与する
4. デスクトップ / スマートフォンで表示形式を切り替える
5. 空状態の表示を用意する

## Phase 2 でやらないこと

- 追加 / 編集 / 削除 UI
- admin 向け編集ボタン

## テスト

- 一覧が表示される
- 開始時刻順に表示される
- 空状態が表示される

## 完了条件

- `/timetable` が認証後に閲覧できる
- page test が追加されている
