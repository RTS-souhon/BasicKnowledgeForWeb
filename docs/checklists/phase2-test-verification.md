# Phase 2 テスト実装確認手順書

Phase 2 (閲覧系コンテンツ) をクローズする際に、Unit Test / Feature Test / E2E Test が漏れなく実装・更新されているかを確認するための手順をまとめる。

## 1. スコープの再確認

1. `docs/implementation-plan.md` と `docs/tasks/phase2-*.md` を開き、Phase2 に含まれるエリアを再確認する。
2. いずれのページ/API も以下の分類に当てはめ、後続のチェックで漏れがないようにする。

| 分類 | 対象 | 期待される主なテスト観点 |
| --- | --- | --- |
| Backend: GET API | timetable / rooms / programs / shop-items / other-items | use-case, controller, repository, validator, Feature (HTTP) |
| Frontend: Server Component ページ | `/`, `/timetable`, `/rooms`, `/events`, `/shop`, `/others` | ページ描画、モバイル/デスクトップ切替、空状態 |
| 認証フロー | `(authenticated)/layout`, access-token 解決 | ルーティング・リダイレクト、event セレクター |

## 2. 事前準備

1. `git checkout develop && git pull` で最新化し、レビュー対象ブランチに切り替える。
2. ルートで `bun install` を実行済みにしておく。
3. DB が必要なテストを想定して `apps/backend/compose.yaml` で CockroachDB を起動 (`docker compose up -d`) できる状態にしておく。

## 3. Backend Unit Test の確認

1. `apps/backend/tests` 配下を以下の観点で確認する。
   - `use-cases/<domain>` ディレクトリが各ドメインに存在し、`Get<List>` / `Create` などの use case を網羅しているか。
   - `presentation/controllers/<domain>Controller.test.ts` が追加され、HTTP ステータスの分岐を検証しているか。
   - `infrastructure/repositories/<domain>` や `validators/<domain>` のユニットテストが増えているか。
2. 例えば `rg "describe\\('GetRoomsUseCase" apps/backend/tests` のように `describe()` 名で検索し、対象ドメインのテストがない場合はブロッカーとして記録する。
3. `cd apps/backend && bun run test --filter <domain>` を実行し、対象ドメインのユニットテストが成功することを確認する。`--filter` は Jest の `-t` に置き換えても良い。
4. テスト内で Phase2 仕様 (部署名、イベントスコープ、ソフトデリート除外など) を検証しているかもチェックし、欠けていればレビューコメントにする。

## 4. Backend Feature Test の確認

1. `apps/backend/tests/features` 配下に各 GET API 用の `*.test.ts` が揃っているか確認する。
2. 各ファイルで `contentAccessMiddleware` を通し、`x-event-id`・Cookie の両シナリオ (access_token / auth_token) が最低1ケースずつ存在するかをチェックする。
3. 実行: `cd apps/backend && bun run test -- tests/features/<domain>.test.ts`。HTTP ステータス・レスポンス shape が Phase2 仕様どおりかログを確認。
4. レスポンスに含まれる派生フィールド (例: `preDayManagerName`) や空状態レスポンスが Feature Test で検証されていることを確認する。

## 5. Frontend Page / Unit Test の確認

1. `apps/frontend/tests/authenticated` および `tests/public` など、ページ種別ごとのディレクトリに Phase2 で追加・改修したページのテストが含まれているか確認する。
2. `apps/frontend/tests/authenticated/<page>/page.test.tsx` が存在し、以下をカバーしているかチェックする。
   - event 未選択時のガード
   - API フェッチのモックとエラーハンドリング
   - モバイル/デスクトップ固有 UI の断片 (テーブル、カード、空状態ラベルなど)
3. 実行: `cd apps/frontend && bun run test -- <relative test path>`。MSW モックが正しく動き、`--forceExit` 以外の警告が出ないことを確認する。
4. UI 仕様との乖離が無いか `docs/pages/*.md` を参照しながら assertion 内容を見直す。特に `rooms` のような複数レイアウトを持つページは両方の断片が検証されているかを確認する。

## 6. E2E Test (UI フロー) の確認

1. E2E テストは Playwright ベースで `apps/frontend/tests/e2e/phase2/*.spec.ts` に配置する運用とする。まだ存在しない場合はタスク化してから Phase2 を閉じない。
2. 各スペックで以下のユーザーフローがシナリオ化されているかチェックする。
   - アクセスコード入力 → `/` → `/timetable` までの遷移
   - 管理者が event セレクターで別会期を参照し `/rooms` などを閲覧
   - モバイル Viewport でのカード表示 (レスポンシブ)
3. 実行: ルートで `bunx playwright test tests/e2e/phase2 --headed`。CI で `bunx playwright test --reporter=line` を回すジョブがあるかも確認する。
4. E2E で使用するテストデータが `apps/backend/tests/helpers/createTestApp.ts` や seed スクリプトと整合しているかをチェックし、齟齬があれば更新する。

## 7. 結果のまとめ

1. すべてのテスト種別について「対象ファイルが存在するか」「コマンドが成功するか」「検証観点が揃っているか」をチェックリスト化し、Notion / GitHub Issue に貼り付ける。
2. 不足があれば対象タスクや PR にコメントし、完了するまで Phase2 のクローズ判定を保留する。

---
この手順書を使うことで、Phase2 の機能がすべて自動テストでカバーされていることをレビュー時に素早く確認できるようにする。
