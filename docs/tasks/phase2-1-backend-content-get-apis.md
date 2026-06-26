# Phase 2-1 Backend: コンテンツスキーマと GET API

## 対象

- `docs/pages/05-timetable.md`
- `docs/pages/06-rooms.md`
- `docs/pages/07-events.md`
- `docs/pages/08-shop.md`
- `docs/pages/13-others.md`

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
7. アクセス制御ミドルウェア `contentAccessMiddleware` を全コンテンツ GET API に適用する（後述）

## アクセス制御

全コンテンツ GET API には `contentAccessMiddleware` を適用する。
このミドルウェアは以下のいずれかを満たすリクエストのみ通過させる。

### access_token（一般ユーザー向け）

Cookie `access_token` の JWT を検証し、以下を両方満たす場合に通過:

- JWT の署名が有効である
- JWT ペイロードの `event_id` が `x-event-id` ヘッダーの値と一致する

`access_token` は `POST /api/access-codes/verify` で発行される。
イベントスコープが固定されており、`x-event-id` との照合により意図しない会期への越境アクセスを防ぐ。

### auth_token（admin 向け）

Cookie `auth_token` の JWT を検証し、以下を両方満たす場合に通過:

- JWT の署名が有効である
- JWT ペイロードの `role` が `admin` である

`auth_token` は `POST /api/auth/login` で発行される。
**`role=user` の `auth_token` は通過できない**。一般ユーザーがコンテンツ API にアクセスする場合は `access_token` が必要。

### 認証失敗時

上記いずれも満たさない場合は `401 Unauthorized` を返す。

## `rooms` テーブル設計

部屋はイベント前日と当日で運用（管理担当・使途）が異なるため、前日・当日を別カラムで管理する。

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `building_name` | varchar(255) | 建物名 |
| `floor` | varchar(50) | フロア（例：1階、2階） |
| `room_name` | varchar(255) | 部屋名 |
| `pre_day_manager_id` | uuid | 前日管理担当部署。複合 FK → departments(event_id, id) (RESTRICT)。NULL 可 |
| `pre_day_purpose` | varchar(255) | 前日の使途。NULL 可 |
| `day_manager_id` | uuid | 当日管理担当部署。複合 FK → departments(event_id, id) (RESTRICT)。NOT NULL |
| `day_purpose` | varchar(255) | 当日の使途。NOT NULL |
| `notes` | text | 備考。NULL 可 |
| `created_at` | timestamp | 自動設定 |
| `updated_at` | timestamp | 自動設定 |

### rooms → departments の複合外部キーについて

`pre_day_manager_id` / `day_manager_id` は単純な `FK → departments.id` ではなく、
`(event_id, manager_id) → departments(event_id, id)` の**複合外部キー**とする。

これにより、別イベントの部署 ID が誤って参照されることを DB レベルで防止できる。

> **実装上の注意（migration 順序）:**
> CockroachDB では、複合外部キーが参照する列の組み合わせに UNIQUE 制約が必要。
> `departments(event_id, id)` への複合 FK を追加するには、先に
> `CREATE UNIQUE INDEX IF NOT EXISTS "departments_event_id_id_idx" ON "departments" ("event_id","id")`
> を実行してから `ADD CONSTRAINT ... FOREIGN KEY` を実行すること。
> migration ファイルでのステートメント順序に注意する。

## `departments` テーブル設計

部署はイベントごとにスコープされる。

| カラム | 型 | 説明 |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `name` | varchar(255) | 部署名 |
| `created_at` | timestamp | 自動設定 |
| `updated_at` | timestamp | 自動設定 |

複合ユニークインデックス `(event_id, id)` を付与する。rooms・user_departments の複合 FK が参照するために必要。

## `user_departments` テーブル設計

1 ユーザーは 1 会期につき 1 部署に所属する。ただし、異なる会期では異なる部署になることもある。
`(user_id, event_id)` を複合 PK とすることで、「1 ユーザー = 1 イベントにつき 1 部署」をDB レベルで保証する。

| カラム | 型 | 説明 |
|---|---|---|
| `user_id` | uuid | FK → users.id (RESTRICT) |
| `event_id` | uuid | FK → access_codes.id (RESTRICT) |
| `department_id` | uuid | 複合 FK → departments(event_id, id) (RESTRICT) |

複合 PK: `(user_id, event_id)`

`department_id` は単純な `FK → departments.id` ではなく `(event_id, department_id) → departments(event_id, id)` の複合外部キーとする。
これにより、別イベントの部署への紐付けを DB レベルで防止できる。

## API 契約

- `GET /api/timetable` + header `x-event-id: <id>` → `{ items: TimetableItem[] }`
- `GET /api/rooms` + header `x-event-id: <id>` → `{ rooms: RoomWithDepartments[] }`
- `GET /api/programs` + header `x-event-id: <id>` → `{ programs: Program[] }`
- `GET /api/shop-items` + header `x-event-id: <id>` → `{ items: ShopItem[] }`
- `GET /api/others` + header `x-event-id: <id>` → `{ items: OtherItem[] }`

`x-event-id` 未指定時の扱いも実装時に統一すること。
推奨は `400` でバリデーションエラーを返すこと。

### RoomWithDepartments 型

rooms API は部署 ID の代わりに部署名を返す。
Drizzle の JOIN（pre_day_dept への LEFT JOIN、day_dept への INNER JOIN）で取得する。

```typescript
type RoomWithDepartments = {
    id: string;
    eventId: string;
    buildingName: string;
    floor: string;
    roomName: string;
    preDayManagerId: string | null;
    preDayManagerName: string | null;  // departments.name（前日担当。NULL 可）
    preDayPurpose: string | null;
    dayManagerId: string;
    dayManagerName: string;            // departments.name（当日担当。NOT NULL）
    dayPurpose: string;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
```

## テスト

- repository test: 各一覧取得の order 条件を確認
- validator test: `event_id` と主要フィールドの型・制約を確認
- feature test:
  - 正常系で expected response shape が返る
  - `x-event-id` ごとの絞り込みが効く
  - 未指定 / 不正な `x-event-id` を弾く（`400`）
  - order 条件が守られている
  - `access_token` の `event_id` と `x-event-id` が不一致のとき `401` を返す
  - `role=user` の `auth_token` では `401` を返す
  - `role=admin` の `auth_token` では通過できる

## 完了条件

- frontend が参照する 5 本の GET API がすべて使える
- `apps/backend` の `type-check`, `test`, `lint` が通る
