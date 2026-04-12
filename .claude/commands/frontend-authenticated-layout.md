---
name: frontend-authenticated-layout
description: `(authenticated)` ルートグループの共通ヘッダーとナビゲーションを実装する Phase2-2 タスク用ガイド。
---

# /frontend-authenticated-layout — 認証済みレイアウト

参照: `docs/tasks/phase2-2-frontend-authenticated-layout.md`

## ゴール
- `(authenticated)` route group 配下で `/`, `/timetable`, `/rooms`, `/events`, `/shop`, `/others` を統一レイアウトに移行
- 共通ヘッダー: イベント名、ナビゲーション、ログアウト導線、会期セレクター（admin/developerのみ）
- モバイルではハンバーガー/ドロワー UI に自動切替

## 手順
1. **Route Group 作成**
   - `apps/frontend/app/(authenticated)/layout.tsx` を追加し、対象ページを配下に移動。
   - 既存 `/` ルートと競合するページは削除またはリネーム。
2. **データ取得**
   - Server Component で `GET /api/access-codes` を呼び、ユーザーの role と会期一覧を取得。
   - 現在の会期 ID を context や zustand で共有し、API 呼び出し時に `x-event-id` header へ渡す helper（例: `buildContentFetchHeaders`）を整備。
3. **ヘッダー/ナビ実装**
   - PC: 水平メニュー (Home, Timetable, Rooms, Events, Shop, Others)。
   - モバイル: ハンバーガー + ドロワーに切り替え、ナビ/会期セレクター/ログアウトを収納。
   - admin/developer のみ会期セレクターを表示。user は非表示。
4. **UI 細部**
   - イベント名をヘッダー内に表示。
   - ログアウト導線を共通コンポーネント化。
   - ナビリンクで現在ページをハイライト。
5. **テスト** (`apps/frontend/tests/`)
   - layout 単体 or layout 経由の page test で以下を確認:
     - 認証済みユーザーで nav が表示される。
     - admin/developer だけ会期セレクターが見える。
     - user ロールではセレクターが非表示。
     - モバイル viewport でハンバーガーが出現し、メニューが開閉できる。
6. **完了チェック**
   ```bash
   cd apps/frontend
   bun run type-check
   bun run lint
   bun run test
   ```

## 提出物
- `(authenticated)/layout.tsx` + 共通ヘッダー/ナビ/会期セレクター実装
- 会期 ID 共有と `x-event-id` header 付与ロジック
- レスポンシブ & ロール別挙動を確認するテスト
