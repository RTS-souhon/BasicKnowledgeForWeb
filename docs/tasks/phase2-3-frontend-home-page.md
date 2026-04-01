# Phase 2-3 Frontend: TOPページ `/`

## 対象

- `docs/pages/04-home.md`

## 目的

認証済みスタッフ向けの入口ページとして、現在の会期名と各ページへの導線を表示する。

## 実装内容

1. TOP ページを `(authenticated)` 配下へ移す
2. 会期名を表示する
   - user: `access_token` の `event_id` から決定
   - admin / developer: frontend で保持している選択中会期 ID から決定
3. ナビゲーションカードを表示する
   - `/timetable`
   - `/rooms`
   - `/events`
   - `/shop`
   - `/others`
   - `/search` は Phase 3 のため導線は出さない
4. スマートフォン時は 2 カラムのカードグリッドにする

## テスト

- ナビゲーションカードが表示される
- 会期名が正しく表示される
- user / admin / developer で共通導線が崩れない

## 完了条件

- TOP ページが layout 配下で表示できる
- page test が追加されている
