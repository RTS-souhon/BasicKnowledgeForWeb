# 企画一覧 `/events`

## 概要

イベント会期の企画（プログラム）の一覧を表示する。
企画名・開催場所・時間・説明を表示。
Admin/Developer はインライン編集・追加・削除が可能。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| access_token 有効 | 閲覧のみ |
| auth_token 有効（admin） | 閲覧 + 編集 |
| それ以外 | `/access` へリダイレクト |

---

## 画面構成

### 閲覧（全ユーザー）— デスクトップ

```
┌──────────────────────────────────────────────┐
│  企画一覧                                      │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │ ○○サークル展示                       │      │
│  │ 会場 A  /  10:00 〜 12:00            │      │
│  │ 説明テキスト...                       │      │
│  └────────────────────────────────────┘      │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### 閲覧（全ユーザー）— スマートフォン

企画一覧は元々カード形式のため、カードを画面幅いっぱいに広げる。

```
┌──────────────────────┐
│  企画一覧             │
│                      │
│  ┌──────────────────┐│
│  │ ○○サークル展示    ││  ← 企画名（大きめフォント）
│  │ 📍 会場 A         ││
│  │ 🕐 10:00 〜 12:00 ││
│  │ 説明テキスト...    ││
│  └──────────────────┘│
│  ...                 │
└──────────────────────┘
```

### 編集モード（Admin/Developer のみ表示）

#### デスクトップ

```
│  [+ 追加]                                    │
│  ○○サークル展示  ...  [編集] [削除]            │
```

#### スマートフォン

```
┌──────────────────────┐
│  [+ 追加]            │
│                      │
│  ┌──────────────────┐│
│  │ ○○サークル展示    ││
│  │ 📍 会場 A         ││
│  │ 🕐 10:00 〜 12:00 ││
│  │              [⋮] ││  ← タップで編集/削除メニュー
│  └──────────────────┘│
```

**スマートフォン固有の要件:**
- カードは画面幅いっぱい（`w-full`）
- 企画名は大きめフォント、会場・時間はアイコン付きで視認性を確保
- 編集・削除は `[⋮]` ボタンのアクションシートで提供

---

## データ構造

```typescript
type Program = {
    id: string
    event_id: string
    name: string
    location: string
    start_time: string   // ISO 8601
    end_time: string
    description: string | null
}
```

---

## API

### GET `/api/programs?event_id=<id>`

- `event_id` の解決:
  - User: `access_token` Cookie の `event_id` を自動付与
  - Admin/Developer: URL クエリパラメータ `?event_id=xxx` を使用
- レスポンス: `{ programs: Program[] }`（`start_time` 昇順）

### POST `/api/programs` （admin）

```json
{
    "event_id": "...",
    "name": "...",
    "location": "...",
    "start_time": "...",
    "end_time": "...",
    "description": "..."
}
```

### PUT `/api/programs/:id` （admin）

### DELETE `/api/programs/:id` （admin）

---

## フロントエンド実装

- `page.tsx`: Server Component → `GET /api/programs` でデータ取得
- 編集 UI: Client Component（モーダルまたはインラインフォーム）
- フォーム: `react-hook-form` + `programSchema`

> **注意**: Next.js App Router の規約では `app/events/` というディレクトリが使えるが、
> `events` はブラウザの組み込みオブジェクトと衝突しないため問題なし。
> バックエンドのテーブル名は `programs`（SQL の `events` 予約語を避けるため）。

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                         programs テーブル追加
src/infrastructure/
  validators/programValidator.ts
  repositories/program/
    IProgramRepository.ts
    ProgramRepository.ts
src/use-cases/program/
  ICreateProgramUseCase.ts / CreateProgramUseCase.ts
  IGetProgramsUseCase.ts   / GetProgramsUseCase.ts
  IUpdateProgramUseCase.ts / UpdateProgramUseCase.ts
  IDeleteProgramUseCase.ts / DeleteProgramUseCase.ts
src/presentation/
  controllers/programController.ts
  routes/programRoutes.ts
```

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | 企画一覧が表示されること |
| 2 | 開始時刻順に並んでいること |
| 3 | user ロール時に編集 UI が表示されないこと |
| 4 | admin ロール時に編集ボタンが表示されること |
| 5 | 追加フォームから新規企画を登録できること |
| 6 | 編集フォームで既存企画を更新できること |
| 7 | 削除ボタンで企画を削除できること |
