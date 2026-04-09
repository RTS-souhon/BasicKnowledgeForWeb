# Phase 2-8 Frontend: `/others`

## 対象

- `docs/pages/12-others.md`

## 目的

その他の情報を閲覧できるページを実装する。  
Phase 2 では閲覧専用とし、編集 UI は入れない。

## 実装内容

1. Server Component として `/others` を実装する
2. backend の `GET /api/others` からデータ取得する
3. タイトルと本文をカード形式で表示する
4. 本文は改行を保って表示する
5. `display_order` 順で表示する
6. 空状態の表示を用意する

## Phase 2 でやらないこと

- 追加 / 編集 / 削除 UI
- 並び替え UI
- admin 向け編集ボタン

## テスト

- 一覧が表示される
- `display_order` 順に表示される
- 改行付きテキストが正しく表示される
- 空状態が表示される

## 完了条件

- `/others` が認証後に閲覧できる
- page test が追加されている
