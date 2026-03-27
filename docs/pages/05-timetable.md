# タイムテーブル `/timetable`

## 概要

イベント会期のタイムスケジュールを一覧表示する。
Admin/Developer はインライン編集・追加・削除が可能。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| access_token 有効 | 閲覧のみ |
| auth_token 有効（admin/developer） | 閲覧 + 編集 |
| それ以外 | `/access` へリダイレクト |

---

## 画面構成

### 閲覧（全ユーザー）

```
┌──────────────────────────────────────────┐
│  タイムテーブル                            │
│                                          │
│  10:00 - 11:00  開会式       [会場 A]     │
│  11:00 - 12:00  ○○企画      [会場 B]     │
│  ...                                     │
└──────────────────────────────────────────┘
```

### 編集モード（Admin/Developer のみ表示）

```
│  [+ 追加]                                 │
│  10:00 - 11:00  開会式  [会場 A]  [編集] [削除] │
```

---

## データ構造

```typescript
type TimetableItem = {
    id: string
    event_id: string
    title: string
    start_time: string   // ISO 8601
    end_time: string
    location: string
    description: string | null
}
```

---

## API

### GET `/api/timetable?event_id=<id>`

- `event_id` の解決:
  - User: `access_token` Cookie の `event_id` を自動付与（Server Component で処理）
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用（未指定時はデータなし）
- レスポンス: `{ items: TimetableItem[] }`（`start_time` 昇順）

### POST `/api/timetable` （admin/developer）

```json
{ "event_id": "...", "title": "...", "start_time": "...", "end_time": "...", "location": "...", "description": "..." }
```

### PUT `/api/timetable/:id` （admin/developer）

部分更新可。変更フィールドのみ送信。

### DELETE `/api/timetable/:id` （admin/developer）

---

## フロントエンド実装

- `page.tsx`: Server Component → `GET /api/timetable` でデータ取得
- 編集 UI: Client Component（モーダルまたはインラインフォーム）
  - `useAuth()` でロールを確認し admin/developer の場合のみ表示
- フォーム: `react-hook-form` + `timetableSchema`（フロントエンド定義）

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                         timetable_items テーブル追加
src/infrastructure/
  validators/timetableValidator.ts
  repositories/timetable/
    ITimetableRepository.ts
    TimetableRepository.ts
src/use-cases/timetable/
  ICreateTimetableItemUseCase.ts / CreateTimetableItemUseCase.ts
  IGetTimetableItemsUseCase.ts  / GetTimetableItemsUseCase.ts
  IUpdateTimetableItemUseCase.ts / UpdateTimetableItemUseCase.ts
  IDeleteTimetableItemUseCase.ts / DeleteTimetableItemUseCase.ts
src/presentation/
  controllers/timetableController.ts
  routes/timetableRoutes.ts
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | タイムテーブル一覧が表示されること |
| 2 | 開始時刻順に並んでいること |
| 3 | user ロール時に編集 UI が表示されないこと |
| 4 | admin ロール時に編集ボタンが表示されること |
| 5 | 追加フォームから新規アイテムを登録できること |
| 6 | 編集フォームで既存アイテムを更新できること |
| 7 | 削除ボタンでアイテムを削除できること |
