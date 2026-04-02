# Phase 2-1 Backend: コンテンツスキーマと GET API

## 対象

- `docs/pages/05-timetable.md`
- `docs/pages/06-rooms.md`
- `docs/pages/07-events.md`
- `docs/pages/08-shop.md`
- `docs/pages/12-others.md`

## 目的

Phase 2 の frontend が参照する閲覧用データ基盤を backend に先行実装する。  
このタスクでは **GET API のみ** を実装し、更新系 API は作らない。

## 実装内容

1. `schema.ts` に以下のテーブルを追加し、Drizzle migration を作成する
   - `timetable_items`
   - `rooms`（詳細は後述）
   - `programs`
   - `shop_items`
   - `other_items`
   - `departments`（部署テーブル。後述）
   - `user_departments`（ユーザーと部署の紐付けテーブル。後述）
2. 各コンテンツテーブルの `event_id` は `access_codes.id` に対して `ON DELETE RESTRICT` の外部キー制約を付与する
3. 各ドメインに validator / repository / use-case / controller / route を追加する
4. 追加する GET API
   - `GET /api/timetable`
   - `GET /api/rooms`
   - `GET /api/programs`
   - `GET /api/shop-items`
   - `GET /api/others`
4. `event_id` の受け取りは request header 前提にする
   - header 名は `x-event-id`
   - user 用の `access_token` 解決は Phase 2 frontend の Server Component 側で行う
   - backend の GET API は `x-event-id` header を必須入力として受け取る
5. 並び順は docs どおりに固定する
   - timetable / programs: `start_time` 昇順
   - rooms: `building_name` → `floor` → `room_name` の複合昇順
   - shop-items: 名前昇順
   - others: `display_order` 昇順
6. `src/index.ts` に各 routes を登録する

## `rooms` テーブル設計

部屋はイベント前日と当日で運用（管理担当・使途）が異なるため、前日・当日を別カラムで管理する。

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `building_name` | varchar(255) | 建物名 |
| `floor` | varchar(50) | フロア（例：1階、2階） |
| `room_name` | varchar(255) | 部屋名 |
| `pre_day_manager_id` | uuid | 前日管理担当部署 FK → departments.id (RESTRICT)。NULL 可 |
| `pre_day_purpose` | varchar(255) | 前日の使途。NULL 可 |
| `day_manager_id` | uuid | 当日管理担当部署 FK → departments.id (RESTRICT)。NOT NULL |
| `day_purpose` | varchar(255) | 当日の使途。NOT NULL |
| `notes` | text | 備考。NULL 可 |
| `created_at` | timestamp | 自動設定 |
| `updated_at` | timestamp | 自動設定 |

## `departments` テーブル設計

部署はイベントごとにスコープされる。

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `name` | varchar(255) | 部署名 |
| `created_at` | timestamp | 自動設定 |
| `updated_at` | timestamp | 自動設定 |

## `user_departments` テーブル設計

1 ユーザーは 1 会期につき 1 部署に所属する。ただし、異なる会期では異なる部署になることもある。
`(user_id, event_id)` を複合 PK とすることで、「1 ユーザー = 1 イベントにつき 1 部署」をDB レベルで保証する。

| カラム | 型 | 説明 |
|---|---|---|
| `user_id` | uuid | FK → users.id (RESTRICT) |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `department_id` | uuid | FK → departments.id (RESTRICT) |

複合 PK: `(user_id, event_id)`

## API 契約

- `GET /api/timetable` + header `x-event-id: <id>` → `{ items: TimetableItem[] }`
- `GET /api/rooms` + header `x-event-id: <id>` → `{ rooms: Room[] }`
- `GET /api/programs` + header `x-event-id: <id>` → `{ programs: Program[] }`
- `GET /api/shop-items` + header `x-event-id: <id>` → `{ items: ShopItem[] }`
- `GET /api/others` + header `x-event-id: <id>` → `{ items: OtherItem[] }`

`x-event-id` 未指定時の扱いも実装時に統一すること。  
推奨は `400` でバリデーションエラーを返すこと。

## テスト

- repository test: 各一覧取得の order 条件を確認
- validator test: `event_id` と主要フィールドの型・制約を確認
- feature test:
  - 正常系で expected response shape が返る
  - `x-event-id` ごとの絞り込みが効く
  - 未指定 / 不正な `x-event-id` を弾く
  - order 条件が守られている

## 完了条件

- frontend が参照する 5 本の GET API がすべて使える
- `apps/backend` の `type-check`, `test`, `lint` が通る
