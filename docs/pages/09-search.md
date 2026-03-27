# 情報検索 `/search`

## 概要

キーワードで、現在の会期に属する全カテゴリ（タイムテーブル・部屋割り・企画・販売物）を横断検索する。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| access_token 有効 | 表示 |
| auth_token 有効（admin/developer） | 表示 |
| それ以外 | `/access` へリダイレクト |

---

## 画面構成

```
┌───────────────────────────────────────────┐
│  情報検索                                   │
│                                           │
│  [キーワードを入力]  [検索]                  │
│                                           │
│  ── タイムテーブル（2件） ──                 │
│  10:00 - 11:00  開会式  [会場 A]           │
│  ...                                      │
│                                           │
│  ── 部屋割り（1件） ──                      │
│  会場 A  スタッフ1  受付                    │
│  ...                                      │
│                                           │
│  ── 企画（3件） ──                          │
│  ○○企画  ...                              │
│  ...                                      │
│                                           │
│  ── 販売物（1件） ──                        │
│  グッズ A  ¥500  在庫あり                  │
│  ...                                      │
│                                           │
│  （0件の場合: "該当する情報が見つかりません"）  │
└───────────────────────────────────────────┘
```

---

## 検索対象フィールド

| テーブル | 検索対象フィールド |
|---|---|
| `timetable_items` | `title`, `location`, `description` |
| `rooms` | `room_name`, `assignee`, `purpose`, `notes` |
| `programs` | `name`, `location`, `description` |
| `shop_items` | `name`, `description` |
| `other_items` | `title`, `content` |

---

## API

### GET `/api/search?q=<keyword>&event_id=<id>`

- `q`: 検索キーワード（必須・1文字以上）
- `event_id` の解決:
  - User: `access_token` Cookie から自動付与
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用
- DB 側で `ILIKE '%keyword%'` による部分一致検索

**レスポンス**
```json
{
    "timetable":   [ { TimetableItem } ],
    "rooms":       [ { Room } ],
    "programs":    [ { Program } ],
    "shop_items":  [ { ShopItem } ],
    "other_items": [ { OtherItem } ]
}
```

---

## フロントエンド実装

- `page.tsx`: Client Component
  - URL クエリパラメータ（`?q=`）で検索状態を管理
  - 入力確定（Enter またはボタン）でパラメータを更新 → データ再取得
- データ取得: `useEffect` + `fetch` または `useSWR`
- 各カテゴリの結果は件数と共にセクション表示
- 0件の場合はカテゴリセクション自体を非表示

> ページ遷移でも検索クエリを保持するため URL パラメータで管理する。

---

## バックエンド実装

### 新規ファイル

```
src/use-cases/search/
  ISearchUseCase.ts
  SearchUseCase.ts     ← 4テーブルを並列クエリ（Promise.all）
src/presentation/
  controllers/searchController.ts
  routes/searchRoutes.ts
```

### SearchUseCase の責務

```typescript
// 5テーブルを並列クエリ
const [timetable, rooms, programs, shopItems, otherItems] = await Promise.all([
    timetableRepo.search(keyword, eventId),
    roomRepo.search(keyword, eventId),
    programRepo.search(keyword, eventId),
    shopItemRepo.search(keyword, eventId),
    otherItemRepo.search(keyword, eventId),
])
```

各リポジトリに `search(keyword, eventId)` メソッドを追加する。

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | 検索フィールドとボタンが表示されること |
| 2 | キーワード入力で全カテゴリの結果が表示されること |
| 3 | 一致するカテゴリのみセクションが表示されること |
| 4 | 0件の場合に「見つかりません」が表示されること |
| 5 | 空クエリで検索できないこと（バリデーション） |
