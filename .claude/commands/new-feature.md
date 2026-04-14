---
name: new-feature
description: 新機能を backend → frontend の順で実装する。ブランチ作成からPR作成までの全フローをガイドする。
---

# /new-feature — 新機能実装フロー

ユーザーが実装したい機能の概要を提供する。

## 前提

- **必ず `develop` から新ブランチを切る**
- **backend を先に実装・テストしてから frontend を実装する**（順序厳守）
- 実装中に `type-check`, `lint`, `test` が通らない状態でコミットしない

## Step 1: ブランチ作成

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<機能名>
# 例: feature/phase2-2-frontend-authenticated-layout
```

ブランチ命名規則:
| Prefix | 用途 |
|---|---|
| `feature/` | 新機能・改善 |
| `fix/` | バグ修正 |
| `docs/` | ドキュメントのみ |
| `chore/` | リファクタリング・ツール |

## Step 2: Backend 実装

新しいリソースを追加する場合は `/add-domain` スキルを使用。

既存の変更の場合:
1. `src/db/schema.ts` — スキーマ変更があれば migration も
2. Repository → Use Case → Controller → Routes の順で実装
3. `src/index.ts` に routes を登録

## Step 3: Backend テスト

```bash
cd apps/backend
bun run type-check
bun run lint
bun run test
```

**全チェックが通るまで Step 4 に進まない。**

## Step 4: Backend コミット

コミットメッセージは**日本語**で記述する:

```
feat(<scope>): <日本語の説明>
test(<scope>): <日本語の説明>
```

例:
```
feat(rooms): GET /api/rooms エンドポイントを追加
test(rooms): GET /api/rooms のフィーチャーテストを追加
```

1つのコミットに複数のレイヤーを混在させない。論理的な単位ごとにコミットを分割する。

## Step 5: Frontend 実装

```
apps/frontend/app/
├── (authenticated)/   # 認証が必要なページ
│   └── {page}/
│       └── page.tsx
└── utils/
    └── client.ts      # hc<AppType>(NEXT_PUBLIC_API_URL) — 型安全な API クライアント
```

認証フロー:
- `access_token` Cookie は Server Component で取得し `x-event-id` と一緒に API に渡す
- Client Component では `'use client'` ディレクティブと `react-hook-form` + `zodResolver` を使用
- Validator は `@backend/infrastructure/validators/...` から直接 import して共有する

## Step 6: Frontend テスト

```bash
cd apps/frontend
bun run type-check
bun run lint
bun run test
```

MSW v2 のテストパターン:
- `tests/mocks/handlers.ts` にハンドラーを追加
- `tests/{feature}/page.test.tsx` でコンポーネントをテスト

## Step 7: Frontend コミット

```
feat(<scope>): <日本語の説明>
test(<scope>): <日本語の説明>
```

## Step 8: PR 作成

```bash
git push -u origin <branch-name>
gh pr create --base develop --title "<prefix>(<scope>): <日本語タイトル>" --body "$(cat <<'EOF'
# Pull Request

## What's changed

<実装内容の説明>

## Todo List

- [ ] <残タスク>

## Remark

なし
EOF
)"
```

**PR タイトルと本文は日本語で記述する。**

## チェックリスト

- [ ] `develop` から新ブランチを切った
- [ ] backend の type-check / lint / test が通る
- [ ] frontend の type-check / lint / test が通る
- [ ] コミットメッセージが日本語かつ Conventional Commits 形式
- [ ] PR タイトル・本文が日本語かつテンプレートに従っている
- [ ] PR が `develop` ブランチをターゲットにしている
