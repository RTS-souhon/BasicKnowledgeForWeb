# アクセスコード入力画面 `/access`

## 概要

イベント会期ごとに発行されたアクセスコードを入力する。
正しいコードを入力すると `access_token` Cookie が発行され、コンテンツページへリダイレクトされる。

---

## アクセス制御

| 条件 | 挙動 |
|---|---|
| 誰でもアクセス可 | 表示 |
| access_token 有効 | `/` へリダイレクト |
| auth_token 有効（admin/developer） | `/` へリダイレクト |

---

## 画面構成

```
┌──────────────────────────────────┐
│    アクセスコードを入力してください   │
│    コード [                      ] │
│    [エラーメッセージ（任意）]        │
│          [入力する]                │
└──────────────────────────────────┘
```

---

## フォームバリデーション

| フィールド | ルール |
|---|---|
| code | 必須 |

---

## API

### `POST /api/access-codes/verify`

**リクエスト**
```json
{ "code": "SUMMER2025" }
```

**レスポンス**
```
200 Set-Cookie: access_token=<JWT>; HttpOnly; Secure; SameSite=Strict
{ "event": { "id", "event_name", "valid_from", "valid_to" } }

400 { "error": "アクセスコードが正しくありません" }
400 { "error": "このアクセスコードは有効期限が切れています" }
```

### access_token payload

```json
{ "event_id": "<access_code_id>", "exp": <valid_to のタイムスタンプ> }
```

Cookie 有効期限: アクセスコードの `valid_to` に合わせる

---

## フロントエンド実装

- `'use client'` コンポーネント
- `react-hook-form` + `zodResolver`
- 成功時: `router.push('/')` でリダイレクト
- エラー時: フォーム上部にグローバルエラー表示

---

## バックエンド実装

### 新規ファイル

```
src/db/schema.ts                          access_codes テーブル追加
src/infrastructure/
  validators/accessCodeValidator.ts
  repositories/access-code/
    IAccessCodeRepository.ts
    AccessCodeRepository.ts
src/use-cases/access-code/
  IVerifyAccessCodeUseCase.ts
  VerifyAccessCodeUseCase.ts
  ICreateAccessCodeUseCase.ts
  CreateAccessCodeUseCase.ts
  IGetAccessCodesUseCase.ts
  GetAccessCodesUseCase.ts
  IDeleteAccessCodeUseCase.ts
  DeleteAccessCodeUseCase.ts
src/presentation/
  controllers/accessCodeController.ts
  routes/accessCodeRoutes.ts
```

### VerifyAccessCodeUseCase の責務

1. `code` でテーブルを検索
2. 存在しない → エラー
3. `valid_to < now()` → 有効期限切れエラー
4. 正常 → `{ event_id }` を含む JWT を署名し Cookie にセット

---

## テスト項目

| # | テスト内容 |
|---|---|
| 1 | コード入力フィールドとボタンが表示されること |
| 2 | 空送信でバリデーションエラーが表示されること |
| 3 | 正しいコードで `/` へリダイレクトされること |
| 4 | 誤ったコードでエラーメッセージが表示されること |
| 5 | 期限切れコードで期限切れエラーが表示されること |
