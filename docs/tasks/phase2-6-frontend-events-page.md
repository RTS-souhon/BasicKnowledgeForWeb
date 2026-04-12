# Phase 2-6 Frontend: `/events`

## 対象

- `docs/pages/07-events.md`

## 目的

企画一覧を閲覧できるページを実装する。  
Phase 2 では閲覧専用とし、編集 UI は入れない。

## 実装内容

1. Server Component として `/events` を実装する
2. backend の `GET /api/programs` からデータ取得する
3. カードベースの一覧表示を作る
4. 会場・時間・説明を見やすく表示する
5. 空状態の表示を用意する

## Phase 2 でやらないこと

- 追加 / 編集 / 削除 UI
- admin 向け編集ボタン

## テスト

- 一覧が表示される
- 開始時刻順に表示される
- 空状態が表示される

## 完了条件

- `/events` が認証後に閲覧できる
- page test が追加されている
