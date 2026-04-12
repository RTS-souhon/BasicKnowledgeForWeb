---
name: rooms-page
description: `/rooms` ページと GET /api/rooms (RoomWithDepartments) を docs/pages/06-rooms.md に沿って実装する手順。
---

# /rooms-page — 部屋割り実装

参照: `docs/pages/06-rooms.md`

## スコープ
- `/rooms` の PC/モバイル UI + admin/developer 編集導線
- `RoomWithDepartments` DTO を返す `GET /api/rooms` と CRUD API
- JOIN / 複合 FK / ロール制御のテスト

## 手順
1. **データ整備**
   - Schema: `rooms` テーブルに `(event_id, pre_day_manager_id)` / `(event_id, day_manager_id)` → `departments(event_id, id)` の複合 FK。
   - `departments` 側に `(event_id, id)` UNIQUE INDEX を追加。
2. **Repository**
   - `alias` を使って前日・当日の部署テーブルを JOIN。
   - 並び順は `building_name` → `floor` → `room_name` 昇順。
3. **Routes / Controller**
   - `GET /api/rooms` は `contentAccessMiddleware` + `x-event-id` header 必須。
   - 編集系 API は role guard（admin/developer 限定）を適用。
4. **Frontend UI**
   - PC: テーブル表示 (部屋名/担当/用途)。
   - モバイル: カード表示で担当・用途を縦積み、`[⋮]` で編集/削除。
   - `react-hook-form` + `roomSchema` を共有化。
5. **編集導線**
   - admin/developer: `[+追加]` ボタン、フォームで部署セレクト (pre/day)。
   - user: 編集 UI 非表示。
6. **テスト**
   - Backend Feature: access_token / auth_token(admin) 成功、auth_token(user) 401、`x-event-id` 不一致 401。
   - Frontend: PC テーブル・モバイルカード・admin 編集 UI・user 非表示をテスト。
7. **完了チェック**
   ```bash
   apps/backend: bun run type-check && bun run lint && bun run test
   apps/frontend: bun run type-check && bun run lint && bun run test
   ```

## 提出物
- `/rooms` ページ UI + 編集導線
- `GET /api/rooms` (RoomWithDepartments)
- JOIN / 複合 FK / ロール別挙動を検証するテスト
