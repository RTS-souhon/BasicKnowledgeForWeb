---
name: timetable-page
description: docs/pages/05-timetable.md をベースに `/timetable` ページと関連 API を実装・改修するときの ToDo をまとめたスキル。
---

# Timetable ページ実装ガイド

参照: `docs/pages/05-timetable.md`

## スコープ
- `/timetable` の UI (PC/モバイル) + 編集 UI (admin)
- `GET /api/timetable` の backend 実装・テスト
- POST/PUT/DELETE (admin) が必要な場合の追加ファイル

## 手順
1. **モデル/DTO**
   - `TimetableItem` 型 (`id`, `event_id`, `title`, `start_time`, `end_time`, `location`, `description`).
   - `start_time` 昇順で返す API 契約を守る。
2. **バックエンド**
   - Schema: `timetable_items` テーブルを `apps/backend/src/db/schema.ts` に追加。
   - Validator / Repository / UseCase / Controller / Routes を Clean Architecture に沿って作成。
   - Routes: `GET /api/timetable` + (必要なら) POST/PUT/DELETE。GET は `x-event-id` header 必須、`contentAccessMiddleware` を適用。
   - 編集系 API では auth/role チェック＋soft delete ポリシーを考慮。
   - テスト: Feature (一覧取得、並び順、role 別アクセス) + 単体。
3. **Frontend (閲覧 UI)**
   - Server Component で `GET /api/timetable` を呼び、`items` を props として Client Component に渡す。
   - PC: 時間・タイトル・会場を行形式で表示。
   - モバイル: カード表示 (時間帯 / タイトル / 📍 会場)。テーブルは使用しない。
4. **編集 UI (admin)**
   - `useAuthContext()`（`app/(authenticated)/auth-context.tsx`）などで role を判定し、編集ボタン・フォームを conditional render。
   - デスクトップ: 行末 `[編集][削除]`。モバイル: `[⋮]` メニューから操作。
   - フォーム: `react-hook-form` + `timetableSchema`。時間入力のバリデーションを追加。
5. **テスト**
   - フロント: ページまたは主要コンポーネントを `@testing-library/react` + MSW でテスト。
     - 並び順、モバイル表示、ロール別 UI、編集操作が想定通りか。
   - Backend: 既述の Feature/Unit。
6. **完了チェック**
   ```bash
   apps/backend: bun run type-check && bun run lint && bun run test
   apps/frontend: bun run type-check && bun run lint && bun run test
   ```

## 成果物
- `/timetable` ページ (PC/モバイル/編集 UI)
- `GET /api/timetable` (必要なら CRUD)
- バリデーション + 役割ベース UI のテスト
