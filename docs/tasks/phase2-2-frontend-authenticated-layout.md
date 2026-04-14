# Phase 2-2 Frontend: `(authenticated)` layout とナビゲーション

## 対象

- `docs/pages/04-home.md`
- 既存の `apps/frontend/app` 配下

## 目的

認証済みユーザー向けページの共通レイアウトを整備する。  
この task 完了後、各コンテンツページは共通ヘッダーとナビゲーションを再利用できる状態にする。

## 実装内容

1. App Router の route group として `(authenticated)` を追加する
2. `(authenticated)/layout.tsx` を作成し、以下を共通化する
   - イベント名表示
   - 各コンテンツページへのナビゲーション
   - ログアウト導線
3. admin でのみ会期セレクターを表示する
   - データ元は既存の `GET /api/access-codes`
   - 選択した会期 ID を保持し、backend fetch 時に `x-event-id` header として渡せるようにする
   - 保持方法は frontend 内で一貫していればよいが、Phase 2 全ページで共通利用できる形にする
4. スマートフォンではハンバーガー / ドロワー形式に切り替える
5. 既存の middleware と矛盾しないルーティング構成にする

## 実装時の前提

- `/dashboard` と `/admin/access-code` は Phase 4 まで未実装
- そのため、Phase 2 の layout では将来ページへのリンクを出さない
- docs のうち共通ヘッダー・会期セレクター・ナビゲーション部分を優先して実装する

## テスト

- 認証済みページで共通ナビゲーションが表示される
- admin だけ会期セレクターが見える
- user では会期セレクターが出ない
- モバイル相当でドロワー導線が表示される

## 完了条件

- `/` `/timetable` `/rooms` `/events` `/shop` `/others` が共通 layout 配下に載せられる
- layout 単体、または layout を通した page test が追加されている
- `apps/frontend` の `type-check`, `test`, `lint` が通る
