# Phase 2-7 Frontend: `/shop`

## 対象

- `docs/pages/08-shop.md`

## 目的

販売物一覧を閲覧できるページを実装する。  
Phase 2 では閲覧専用とし、編集 UI は入れない。

## 実装内容

1. Server Component として `/shop` を実装する
2. backend の `GET /api/shop-items` からデータ取得する
3. 価格表示と在庫ステータス表示を整える
4. スマートフォンではカード形式にする
5. `stock_status` ごとのバッジ文言と色を統一する
6. 空状態の表示を用意する

## Phase 2 でやらないこと

- 追加 / 編集 / 削除 UI
- admin / developer 向け編集ボタン

## テスト

- 一覧が表示される
- 在庫ステータスの文言と見た目が正しい
- name 順に表示される
- 空状態が表示される

## 完了条件

- `/shop` が認証後に閲覧できる
- page test が追加されている
