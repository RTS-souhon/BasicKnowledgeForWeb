# 部屋割り `/rooms`

## 概要

イベント会期の部屋・スペースの割り当て情報を一覧表示する。
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

### 閲覧（全ユーザー）— デスクトップ

```
┌─────────────────────────────────────────┐
│  部屋割り                                │
│                                         │
│  部屋名       担当者       用途          │
│  ─────────────────────────────────      │
│  会場 A       スタッフ1    受付          │
│  会場 B       スタッフ2    メイン企画    │
│  ...                                    │
└─────────────────────────────────────────┘
```

### 閲覧（全ユーザー）— スマートフォン

横3列テーブルは幅が足りないため、カードレイアウトに切り替える。

```
┌──────────────────────┐
│  部屋割り             │
│                      │
│  ┌──────────────────┐│
│  │ 会場 A            ││  ← 部屋名（大きめフォント）
│  │ 担当: スタッフ1    ││
│  │ 用途: 受付        ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ 会場 B            ││
│  │ 担当: スタッフ2    ││
│  │ 用途: メイン企画   ││
│  └──────────────────┘│
│  ...                 │
└──────────────────────┘
```

### 編集モード（Admin/Developer のみ表示）

#### デスクトップ

```
│  [+ 追加]                                        │
│  会場 A  スタッフ1  受付  [編集] [削除]            │
```

#### スマートフォン

```
┌──────────────────────┐
│  [+ 追加]            │
│                      │
│  ┌──────────────────┐│
│  │ 会場 A            ││
│  │ 担当: スタッフ1    ││
│  │ 用途: 受付        ││
│  │              [⋮] ││  ← タップで編集/削除メニュー
│  └──────────────────┘│
```

**スマートフォン固有の要件:**
- 3列テーブルは使用せず、1カラムのカードリストで表示
- 部屋名を最上段に大きく表示し、担当者・用途をラベル付きで縦積み
- 編集・削除は `[⋮]` ボタンのアクションシートで提供

---

## データ構造

```typescript
type Room = {
    id: string
    event_id: string
    room_name: string
    assignee: string
    purpose: string
    notes: string | null
}
```

---

## API

### GET `/api/rooms?event_id=<id>`

- `event_id` の解決:
  - User: `access_token` Cookie の `event_id` を自動付与
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用
- レスポンス: `{ rooms: Room[] }`（`room_name` 昇順）

### POST `/api/rooms` （admin/developer）

```json
{ "event_id": "...", "room_name": "...", "assignee": "...", "purpose": "...", "notes": "..." }
```

### PUT `/api/rooms/:id` （admin/developer）

### DELETE `/api/rooms/:id` （admin/developer）

---

## フロントエンド実装

- `page.tsx`: Server Component → `GET /api/rooms` でデータ取得
- 編集 UI: Client Component（モーダルまたはインラインフォーム）
- フォーム: `react-hook-form` + `roomSchema`

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                         rooms テーブル追加
src/infrastructure/
  validators/roomValidator.ts
  repositories/room/
    IRoomRepository.ts
    RoomRepository.ts
src/use-cases/room/
  ICreateRoomUseCase.ts / CreateRoomUseCase.ts
  IGetRoomsUseCase.ts   / GetRoomsUseCase.ts
  IUpdateRoomUseCase.ts / UpdateRoomUseCase.ts
  IDeleteRoomUseCase.ts / DeleteRoomUseCase.ts
src/presentation/
  controllers/roomController.ts
  routes/roomRoutes.ts
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | 部屋割り一覧が表示されること |
| 2 | user ロール時に編集 UI が表示されないこと |
| 3 | admin ロール時に編集ボタンが表示されること |
| 4 | 追加フォームから新規部屋割りを登録できること |
| 5 | 編集フォームで既存情報を更新できること |
| 6 | 削除ボタンで部屋割りを削除できること |
