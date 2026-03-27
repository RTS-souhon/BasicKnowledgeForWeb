# 実装プラン — イベントスタッフ向けサイト

## 概要

イベントスタッフ向けの情報共有サイト。アクセスコードによる閲覧制限と、ユーザーアカウントによる管理機能を組み合わせる。

---

## ロール定義

| ロール | 説明 |
|---|---|
| `user` | アクセスコードを入力してコンテンツを閲覧する一般スタッフ |
| `admin` | アクセスコード管理・全コンテンツの登録・編集が可能 |
| `developer` | admin と同等の権限 |

> 初期の admin アカウントは DB に直接作成する。以降は admin・developer が `/dashboard` のユーザー管理からロールを変更できる。

---

## 認証の2系統

### 1. ユーザー認証（JWT Cookie）

- Cookie 名: `auth_token`
- ログイン: `POST /api/auth/login` → HttpOnly Cookie 発行
- 対象ページ: `/login`, `/dashboard`, `/admin/*`
- Admin/Developer はユーザー認証のみでコンテンツページも閲覧・編集可

### 2. アクセスコード認証（JWT Cookie）

- Cookie 名: `access_token`
- 入力: `POST /api/access-codes/verify` → HttpOnly Cookie 発行
- 対象ページ: `/`, `/timetable`, `/rooms`, `/events`, `/shop`, `/search`
- User ロールのみ必要（Admin/Developer はユーザー認証で代替）
- Cookie payload: `{ event_id, exp }`

---

## Next.js middleware.ts によるルート保護

```
公開                 /login, /register, /access
                      → 認証不要

コンテンツ保護        /, /timetable, /rooms, /events, /shop, /search
                      → access_token が有効                     → 許可
                      → auth_token が有効 + admin/developer ロール → 許可
                      → それ以外                                → /access へリダイレクト

ユーザー保護          /dashboard
                      → auth_token が有効                       → 許可
                      → それ以外                                → /login へリダイレクト

管理者保護            /admin/*
                      → auth_token が有効 + admin/developer       → 許可
                      → それ以外                                → /login へリダイレクト
```

---

## データモデル

```sql
-- 既存
users
  id uuid PK, name, email, password
  role: 'user' | 'admin' | 'developer'
  created_at, updated_at, deleted_at

-- 新規
access_codes
  id uuid PK
  code        varchar(50) UNIQUE   -- ユーザーが入力するコード
  event_name  varchar(255)         -- 会期名（例: "2025夏イベント"）
  valid_from  timestamp
  valid_to    timestamp
  created_by  uuid FK→users.id
  created_at  timestamp

timetable_items
  id uuid PK
  event_id    uuid FK→access_codes.id
  title       varchar(255)
  start_time  timestamp
  end_time    timestamp
  location    varchar(255)
  description text
  created_by  uuid FK→users.id
  created_at, updated_at timestamp

rooms
  id uuid PK
  event_id    uuid FK→access_codes.id
  room_name   varchar(255)
  assignee    varchar(255)
  purpose     varchar(255)
  notes       text
  created_by  uuid FK→users.id
  created_at, updated_at timestamp

programs（企画）
  id uuid PK
  event_id    uuid FK→access_codes.id
  name        varchar(255)
  location    varchar(255)
  start_time  timestamp
  end_time    timestamp
  description text
  created_by  uuid FK→users.id
  created_at, updated_at timestamp

shop_items（販売物）
  id uuid PK
  event_id    uuid FK→access_codes.id
  name        varchar(255)
  price       integer
  stock_status varchar(50)   -- 'available' | 'low' | 'sold_out'
  description text
  created_by  uuid FK→users.id
  created_at, updated_at timestamp

other_items（その他の情報）
  id uuid PK
  event_id      uuid FK→access_codes.id
  title         varchar(255)
  content       text
  display_order integer
  created_by    uuid FK→users.id
  created_at, updated_at timestamp
```

---

## ページ一覧とアクセス制御

```
公開
  /login                    ログイン画面
  /register                 ユーザー登録画面（実装済み）
  /access                   アクセスコード入力画面

コンテンツ（access_token or admin/developer）
  /                         TOPページ・ナビゲーション
  /timetable                タイムテーブル（admin/developer は編集可）
  /rooms                    部屋割り（admin/developer は編集可）
  /events                   企画一覧（admin/developer は編集可）
  /shop                     販売物一覧（admin/developer は編集可）
  /others                   その他の情報（admin/developer は編集可）
  /search                   情報検索（横断検索）

ユーザー（auth_token）
  /dashboard                プロフィール・パスワード変更・ロール確認

管理者（auth_token + admin/developer）
  /admin/access-code        アクセスコード管理
```

---

## API 設計

### 認証

```
POST /api/auth/login           → auth_token Cookie 発行
POST /api/auth/logout          → Cookie 削除
GET  /api/auth/me              → { id, name, email, role }
```

### アクセスコード

```
POST   /api/access-codes/verify   誰でも  → access_token Cookie 発行
GET    /api/access-codes          admin/developer
POST   /api/access-codes          admin/developer
DELETE /api/access-codes/:id      admin/developer
```

### ユーザー管理

```
GET /api/users                admin/developer  → ユーザー一覧
PUT /api/users/:id/role       admin/developer  → ロール変更
```

### コンテンツ（各ドメイン共通パターン）

```
GET    /api/timetable?event_id=xxx   access_token or admin/developer
POST   /api/timetable                admin/developer
PUT    /api/timetable/:id            admin/developer
DELETE /api/timetable/:id            admin/developer

-- rooms, programs, shop-items, others も同パターン
GET/POST/PUT/DELETE /api/rooms
GET/POST/PUT/DELETE /api/programs
GET/POST/PUT/DELETE /api/shop-items
GET/POST/PUT/DELETE /api/others
```

### 検索

```
GET /api/search?q=keyword&event_id=xxx   access_token or admin/developer
  → timetable_items / rooms / programs / shop_items / other_items を横断
```

---

## バックエンド構成（Clean Architecture）

```
src/
├── db/
│   └── schema.ts                    access_codes, timetable_items, rooms, programs, shop_items 追加
├── infrastructure/
│   ├── validators/
│   │   ├── accessCodeValidator.ts
│   │   ├── timetableValidator.ts
│   │   ├── roomValidator.ts
│   │   ├── programValidator.ts
│   │   ├── shopItemValidator.ts
│   │   ├── otherItemValidator.ts
│   │   └── userRoleValidator.ts
│   └── repositories/
│       ├── user/                    IUserRepository (既存), UserRepository (既存) + updateRole 追加
│       ├── access-code/             IAccessCodeRepository, AccessCodeRepository
│       ├── timetable/               ITimetableRepository, TimetableRepository
│       ├── room/                    IRoomRepository, RoomRepository
│       ├── program/                 IProgramRepository, ProgramRepository
│       ├── shop-item/               IShopItemRepository, ShopItemRepository
│       └── other-item/              IOtherItemRepository, OtherItemRepository
├── use-cases/
│   ├── auth/                        ILoginUseCase, LoginUseCase (JWT 発行)
│   │                                IChangePasswordUseCase, ChangePasswordUseCase
│   ├── user/                        IGetUsersUseCase, GetUsersUseCase
│   │                                IUpdateUserRoleUseCase, UpdateUserRoleUseCase
│   ├── access-code/                 Create / Verify / GetList / Delete
│   ├── timetable/                   Create / GetList / Update / Delete
│   ├── room/                        Create / GetList / Update / Delete
│   ├── program/                     Create / GetList / Update / Delete
│   ├── shop-item/                   Create / GetList / Update / Delete
│   ├── other-item/                  Create / GetList / Update / Delete
│   └── search/                      ISearchUseCase, SearchUseCase
└── presentation/
    ├── middleware/
    │   ├── authMiddleware.ts         JWT Cookie 検証
    │   └── roleGuard.ts             admin/developer チェック
    ├── controllers/
    │   ├── authController.ts
    │   ├── userController.ts
    │   ├── accessCodeController.ts
    │   ├── timetableController.ts
    │   ├── roomController.ts
    │   ├── programController.ts
    │   ├── shopItemController.ts
    │   ├── otherItemController.ts
    │   └── searchController.ts
    └── routes/
        ├── authRoutes.ts
        ├── userRoutes.ts
        ├── accessCodeRoutes.ts
        ├── timetableRoutes.ts
        ├── roomRoutes.ts
        ├── programRoutes.ts
        ├── shopItemRoutes.ts
        ├── otherItemRoutes.ts
        └── searchRoutes.ts
```

---

## フロントエンド構成

```
app/
├── (public)/                         公開ページ（認証不要）
│   ├── login/page.tsx
│   ├── register/page.tsx             実装済み
│   └── access/page.tsx
├── (authenticated)/                  アクセスコード認証済み
│   ├── layout.tsx                    共通ヘッダー・ナビゲーション + イベントセレクター
│   ├── page.tsx                      TOPページ
│   ├── timetable/page.tsx
│   ├── rooms/page.tsx
│   ├── events/page.tsx
│   ├── shop/page.tsx
│   ├── others/page.tsx
│   └── search/page.tsx
├── dashboard/page.tsx                ユーザー認証済み（プロフィール・PW変更・ロール管理）
└── admin/
    ├── layout.tsx                    admin/developer ロールチェック
    └── access-code/page.tsx
middleware.ts                         ルート保護
hooks/
└── useAuth.ts                        auth_token → /api/auth/me
```

> データ取得は Server Components で直接 fetch。
> フォーム・インタラクションは Client Components（react-hook-form）で実装。
> Hono RPC client は Client Components のみで使用。

### イベント選択（Admin/Developer）

- User は access_token の Cookie payload（`event_id`）を使用して会期が決まる
- Admin/Developer は access_token を持たないため、各コンテンツページで会期をドロップダウンで選択する
- 選択した `event_id` は URL クエリパラメータ（`?event_id=xxx`）で管理する
- `(authenticated)/layout.tsx` の共通ヘッダーに会期セレクターを配置し、auth_token + admin/developer の場合のみ表示

---

## フェーズ別実装順序

### フェーズ 1: 認証基盤

| # | 対象 | 内容 |
|---|---|---|
| 1-1 | Backend | `access_codes` テーブル・API（verify / 一覧 / 作成 / 削除） |
| 1-2 | Backend | 認証 API（login / logout / me）+ JWT ミドルウェア |
| 1-3 | Frontend | `/login` ページ |
| 1-4 | Frontend | `/access` ページ |
| 1-5 | Frontend | `middleware.ts` ルート保護 |

### フェーズ 2: スタッフ向けコンテンツ（閲覧）

| # | 対象 | 内容 |
|---|---|---|
| 2-1 | Backend | 各コンテンツテーブル + GET API（timetable / rooms / programs / shop-items / other-items） |
| 2-2 | Frontend | `(authenticated)` layout・ナビゲーション |
| 2-3 | Frontend | `/`・`/timetable`・`/rooms`・`/events`・`/shop`・`/others` |

### フェーズ 3: 検索

| # | 対象 | 内容 |
|---|---|---|
| 3-1 | Backend | 横断検索 API（`/api/search`） |
| 3-2 | Frontend | `/search` ページ |

### フェーズ 4: 管理機能（編集・管理画面）

| # | 対象 | 内容 |
|---|---|---|
| 4-1 | Backend | 各コンテンツ POST/PUT/DELETE API |
| 4-2 | Backend | ユーザー管理 API（GET /api/users・PUT /api/users/:id/role） |
| 4-3 | Frontend | 各コンテンツページに編集 UI 追加（admin/developer のみ表示） |
| 4-4 | Frontend | `/dashboard` ページ（プロフィール・PW変更・ロール管理） |
| 4-5 | Frontend | `/admin/access-code` ページ |

---

## 実装チェックリスト

### フェーズ 1
- [ ] Backend: `access_codes` スキーマ・マイグレーション
- [ ] Backend: アクセスコード API（verify / 一覧 / 作成 / 削除）
- [ ] Backend: 認証 API（login / logout / me）
- [ ] Backend: JWT ミドルウェア・roleGuard
- [ ] Frontend: `/login` ページ + テスト
- [ ] Frontend: `/access` ページ + テスト
- [ ] Frontend: `middleware.ts`

### フェーズ 2
- [ ] Backend: timetable_items / rooms / programs / shop_items / other_items スキーマ
- [ ] Backend: 各コンテンツ GET API
- [ ] Frontend: `(authenticated)` layout・ナビゲーション
- [ ] Frontend: `/` TOPページ + テスト
- [ ] Frontend: `/timetable` + テスト
- [ ] Frontend: `/rooms` + テスト
- [ ] Frontend: `/events` + テスト
- [ ] Frontend: `/shop` + テスト
- [ ] Frontend: `/others` + テスト

### フェーズ 3
- [ ] Backend: 横断検索 API
- [ ] Frontend: `/search` + テスト

### フェーズ 4
- [ ] Backend: 各コンテンツ POST/PUT/DELETE API
- [ ] Backend: ユーザー管理 API（GET /api/users・PUT /api/users/:id/role）
- [ ] Frontend: 各コンテンツページへ編集 UI 追加 + テスト
- [ ] Frontend: `/dashboard` （プロフィール・PW変更・ロール管理） + テスト
- [ ] Frontend: `/admin/access-code` + テスト
