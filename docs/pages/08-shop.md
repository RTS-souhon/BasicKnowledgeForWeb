# 販売物一覧 `/shop`

## 概要

イベント会期の販売物（商品）の情報を一覧表示する閲覧専用ページ。
スタッフが販売物の名称・価格・在庫状況を確認するために使用する（EC 機能なし）。
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
┌────────────────────────────────────────┐
│  販売物一覧                              │
│                                        │
│  商品名       価格    在庫              │
│  ─────────────────────────────         │
│  グッズ A     ¥500    在庫あり          │
│  グッズ B     ¥1,000  残りわずか        │
│  グッズ C     ¥200    完売             │
│  ...                                   │
└────────────────────────────────────────┘
```

### 在庫ステータスの表示

| `stock_status` | 表示 | 色 |
|---|---|---|
| `available` | 在庫あり | 緑 |
| `low` | 残りわずか | 黄 |
| `sold_out` | 完売 | 赤 |

### 編集モード（Admin/Developer のみ表示）

```
│  [+ 追加]                                       │
│  グッズ A  ¥500  在庫あり  [編集] [削除]         │
```

---

## データ構造

```typescript
type ShopItem = {
    id: string
    event_id: string
    name: string
    price: number
    stock_status: 'available' | 'low' | 'sold_out'
    description: string | null
}
```

---

## API

### GET `/api/shop-items?event_id=<id>`

- `event_id` の解決:
  - User: `access_token` Cookie の `event_id` を自動付与
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用
- レスポンス: `{ items: ShopItem[] }`（`name` 昇順）

### POST `/api/shop-items` （admin/developer）

```json
{
    "event_id": "...",
    "name": "...",
    "price": 500,
    "stock_status": "available",
    "description": "..."
}
```

### PUT `/api/shop-items/:id` （admin/developer）

### DELETE `/api/shop-items/:id` （admin/developer）

---

## フロントエンド実装

- `page.tsx`: Server Component → `GET /api/shop-items` でデータ取得
- 編集 UI: Client Component
- フォーム: `react-hook-form` + `shopItemSchema`
  - `price` は非負整数のバリデーション追加
  - `stock_status` は Select ドロップダウン

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                         shop_items テーブル追加
src/infrastructure/
  validators/shopItemValidator.ts
  repositories/shop-item/
    IShopItemRepository.ts
    ShopItemRepository.ts
src/use-cases/shop-item/
  ICreateShopItemUseCase.ts / CreateShopItemUseCase.ts
  IGetShopItemsUseCase.ts   / GetShopItemsUseCase.ts
  IUpdateShopItemUseCase.ts / UpdateShopItemUseCase.ts
  IDeleteShopItemUseCase.ts / DeleteShopItemUseCase.ts
src/presentation/
  controllers/shopItemController.ts
  routes/shopItemRoutes.ts
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | 販売物一覧が表示されること |
| 2 | 在庫ステータスが正しい色・テキストで表示されること |
| 3 | user ロール時に編集 UI が表示されないこと |
| 4 | admin ロール時に編集ボタンが表示されること |
| 5 | 追加フォームから新規販売物を登録できること |
| 6 | 編集フォームで在庫ステータスを変更できること |
| 7 | 削除ボタンで販売物を削除できること |
