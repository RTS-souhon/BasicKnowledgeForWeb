---
name: timetable-page
description: `/timetable` の UI・backend API・編集導線を docs/pages/05-timetable.md どおりに実装するためのガイド。
---

# /timetable-page — タイムテーブル実装

参照: `docs/pages/05-timetable.md`

## スコープ
- `/timetable` ページの PC・モバイル UI と admin/developer の編集モード
- `GET /api/timetable`（必要に応じて POST/PUT/DELETE）の backend 実装
- UI と API のテスト

## 手順
1. **Schema + Repository**
   - `timetable_items` テーブルを Drizzle schema に追加。
   - Repository は `start_time` 昇順でデータを返す。
2. **Validator / Use Case / Controller / Routes**
   - `x-event-id` header 必須。
   - `contentAccessMiddleware` を GET ルートへ適用。
   - 編集系 API を追加する場合は auth/role ガードを組み込む。
3. **Frontend UI**
   - Server Component で `GET /api/timetable` を呼び、Client Component へ props で渡す。
   - デスクトップ: 時刻・タイトル・会場を行表示。
   - モバイル: カード表示（時間帯/タイトル/会場）。テーブルは使用しない。
4. **編集 UI (admin/developer)**
   - デスクトップ: 行末 `[編集][削除]` + `[+ 追加]`。
   - モバイル: `[⋮]` メニューで編集/削除を提供。
   - フォームは `react-hook-form` + `timetableSchema` を共有。
5. **テスト**
   - Backend Feature: access_token / auth_token(admin) 成功、auth_token(user) 401、`x-event-id` 不一致 401 を確認。
   - Frontend: 並び順・モバイル表示・admin 編集 UI・user 非表示を @testing-library + MSW で検証。
6. **完了チェック**
   ```bash
   apps/backend: bun run type-check && bun run lint && bun run test
   apps/frontend: bun run type-check && bun run lint && bun run test
   ```

## 提出物
- `/timetable` ページ UI + 編集導線
- `GET /api/timetable` (および必要な CRUD)
- Feature/Unit/UI テスト
