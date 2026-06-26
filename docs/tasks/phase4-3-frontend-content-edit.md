# Phase 4-3 Frontend: コンテンツ編集 UI

## 対象

- `docs/implementation-plan.md`
- `docs/pages/05-timetable.md`
- `docs/pages/06-rooms.md`
- `docs/pages/07-events.md`
- `docs/pages/08-shop.md`
- `docs/pages/13-others.md`

## 目的

admin ロールでログインしたユーザーが、各コンテンツページから直接アイテムの追加・編集・削除を行えるように UI を実装する。

## 実装内容

1. `(authenticated)` 配下の各ページに `useAuth()` を導入し、`role === 'admin'` のときだけ編集操作を表示
2. タイムテーブル / 企画はモーダルフォーム、部屋割り / 販売物 / その他はサイドパネルまたはモーダルで CRUD を提供
3. フォームは `react-hook-form` + backend 共有 validator を使用し、API 呼び出しは Server Actions もしくは Route Handler 経由で `/api/<domain>` POST/PUT/DELETE を実行
4. 成功時は再検証（`revalidatePath('/timetable')` 等）で最新データを取得し、失敗時はトーストでエラーを表示
5. モバイルでは `[⋮]` メニュー / アクションシートを利用して編集ボタンを提供し、タッチターゲット 44px を維持
6. `/shop` の編集では画像アップロード UI を必須にし、`POST /api/shop-items/upload`（`multipart/form-data`）でアップロード → 取得した `imageKey` を `image_key` としてフォームに設定して送信する。送信前にプレビューを表示する

### 画像アップロード UI ガイドライン

- 画像選択時にドラッグ & ドロップ + ファイルピッカーの両方を提供し、1 商品 1 枚が必須
- アップロード処理は `useTransition` などで状態管理し、アップロード完了後に `image_url` のプレビュー（角丸カード）を再描画する
- アクセスコード単位でディレクトリを分ける（`shop-items/<event_id>/<uuid>.webp`）ことを UI 上で明示し、別イベントへのアップロード混入を防ぐ
- 画像の再アップロードでは古い `image_key` をフォーム上で置き換えるだけにし、実ファイル削除は後続タスクに委ねる

## このフェーズでやらないこと

- `/dashboard`, `/admin/access-codes` の UI（他タスク）
- Search ページの UI（Phase 3）

## テスト

- 各ページで admin には編集ボタンが表示され、user には表示されない
- フォーム送信が `fetch` モックを通じて正しい API を呼ぶ
- エラー時にエラーメッセージが表示される

## 完了条件

- 5 ページすべてで CRUD UI が利用可能になり、ロール条件・API 呼び出しを検証するコンポーネント or page テストが追加されている
