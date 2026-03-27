# その他の情報 `/others`

## 概要

タイムテーブル・部屋割り・企画・販売物のいずれのカテゴリにも属さない、
イベント固有の情報（注意事項・連絡先・お知らせ等）を自由に登録・閲覧するページ。
Admin/Developer はアイテムの追加・編集・削除が可能。

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
┌────────────────────────────────────────┐
│  その他の情報                            │
│                                        │
│  ── 注意事項 ──────────────────────     │
│  当日の持ち物について...               │
│                                        │
│  ── 緊急連絡先 ────────────────────     │
│  責任者: 090-XXXX-XXXX ...             │
│                                        │
│  ...                                   │
└────────────────────────────────────────┘
```

### 編集モード（Admin/Developer のみ表示）

```
│  [+ 追加]                                          │
│  ── 注意事項 ──  [編集] [削除]                      │
│  当日の持ち物について...                             │
```

---

## データ構造

```typescript
type OtherItem = {
    id: string
    event_id: string
    title: string
    content: string        // 自由記述テキスト
    display_order: number  // 表示順（昇順）
    created_by: string
    created_at: string
    updated_at: string
}
```

---

## API

### GET `/api/others?event_id=<id>`

- `event_id` の解決:
  - User: `access_token` Cookie の `event_id` を自動付与
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用
- レスポンス: `{ items: OtherItem[] }`（`display_order` 昇順）

### POST `/api/others` （admin/developer）

```json
{
    "event_id": "...",
    "title": "注意事項",
    "content": "当日の持ち物について...",
    "display_order": 1
}
```

**レスポンス**
```
201 { "item": { OtherItem } }
400 { "error": "バリデーションエラー" }
```

### PUT `/api/others/:id` （admin/developer）

部分更新可。変更フィールドのみ送信。

### DELETE `/api/others/:id` （admin/developer）

```
200 { "message": "削除しました" }
404 { "error": "アイテムが見つかりません" }
```

---

## フロントエンド実装

- `page.tsx`: Server Component → `GET /api/others` でデータ取得
- 編集 UI: Client Component
  - `useAuth()` でロールを確認し admin/developer の場合のみ表示
- フォーム: `react-hook-form` + `otherItemSchema`
  - `display_order` は数値入力（デフォルト: 既存アイテム数 + 1）
  - `content` は複数行テキストエリア
- 削除: 確認ダイアログ → `DELETE /api/others/:id` → 一覧を更新

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                         other_items テーブル追加
src/infrastructure/
  validators/otherItemValidator.ts
  repositories/other-item/
    IOtherItemRepository.ts
    OtherItemRepository.ts
src/use-cases/other-item/
  ICreateOtherItemUseCase.ts / CreateOtherItemUseCase.ts
  IGetOtherItemsUseCase.ts   / GetOtherItemsUseCase.ts
  IUpdateOtherItemUseCase.ts / UpdateOtherItemUseCase.ts
  IDeleteOtherItemUseCase.ts / DeleteOtherItemUseCase.ts
src/presentation/
  controllers/otherItemController.ts
  routes/otherItemRoutes.ts
```

### otherItemValidator.ts

```typescript
const createOtherItemSchema = z.object({
    event_id: z.string().uuid(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    display_order: z.number().int().nonnegative(),
})
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | その他情報一覧が表示されること |
| 2 | display_order 昇順で並んでいること |
| 3 | user ロール時に編集 UI が表示されないこと |
| 4 | admin ロール時に編集ボタンが表示されること |
| 5 | 追加フォームから新規アイテムを登録できること |
| 6 | 編集フォームで既存アイテムを更新できること |
| 7 | 削除ボタンでアイテムを削除できること |
| 8 | 0件の場合に空状態が表示されること |
