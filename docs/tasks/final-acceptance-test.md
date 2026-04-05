# Final Acceptance Test: 全機能横断テスト

## 対象

- `docs/implementation-plan.md`
- 各 Phase タスク (Phase1〜Phase4)

## 目的

本番相当環境でユーザー/管理者の主要ユースケースをエンドツーエンドで検証し、リリース可否を判断する。

## 実施前提

- Backend / Frontend の最新ビルドを dev 環境へデプロイ済み
- CockroachDB にテストデータ（access code, timetable, rooms 等）を投入済み
- テストアカウント: `admin@example.com` (admin), `user@example.com` (user)

## テスト観点

1. **認証**
   - `/login` ログイン成功/失敗、`auth_token` の発行/削除
   - `/access` で access code 入力 → Cookie 設定 → `/` へ遷移
2. **コンテンツ閲覧**
   - `/`, `/timetable`, `/rooms`, `/events`, `/shop`, `/others`, `/search` が event 選択とアクセス制御通りに表示される
   - スマホ/デスクトップ表示差分の主要箇所を確認
3. **検索**
   - `/search` で keyword に応じて複数カテゴリ結果が表示される
   - 0 件時の空状態
4. **コンテンツ編集 (admin/developer)**
   - 各ページで CRUD 操作ができ、更新内容が即座に閲覧ページへ反映
   - 権限なしで編集 UI が表示されないこと
5. **ユーザー管理 / Dashboard**
   - `/dashboard` でプロフィール表示、パスワード変更、ユーザー一覧・ロール変更が動作
6. **アクセスコード管理**
   - `/admin/access-code` で一覧取得、新規発行、削除が動作
7. **セキュリティ/認可**
   - 不正 Cookie や event_id で API を叩いた際に 401/403 が返る
   - CORS 設定の確認（dev/prod 域）
8. **レスポンス/ログ**
   - Cloudflare Worker ログにエラーが出ていない・環境変数が正しく読み込まれている

## 手順

1. dev 環境 URL を用い、ブラウザとモバイルシミュレーター両方でテスト
2. 各シナリオの結果をテストシートに記録（Pass/Fail + メモ）
3. 失敗時は GitHub Issue を起票し、修正コミット後に再テスト
4. すべて Pass 後、リリース承認ミーティングで結果を共有

## 成功基準

- 上記観点の全テストケースが Pass
- 既知の残課題は Issue 化済みで、リリース判断に問題なしと関係者が合意
