---
name: new-feature
description: 新機能を実装するときの標準フロー。developからのブランチ作成、backend→frontendの実装順序、各チェックとPR作成ルールを網羅する。
---

# 新機能実装ワークフロー

このリポジトリで新機能を安全に進めるための標準フロー。Backend→Frontend の順序を必ず守ること。

## 0. ブランチ作成
```bash
git checkout develop
git pull origin develop
git checkout -b feature/<task-name>
```
Prefix: `feature/`, `fix/`, `docs/`, `chore/`。`develop` へ直 push しない。
作業開始前に `git status` で既存の未コミット変更を確認し、無関係な差分を混ぜない。

## 1. Backend を先に完了
1. 新しいリソースなら `/add-domain` ワークフローで schema→repo→use case→controller→route→index を実装。
2. `apps/backend` で以下をすべて PASS させる:
   ```bash
   bun run type-check
   bun run lint
   bun run test
   ```
3. 未通過のまま次工程へ進まない。

## 2. Backend コミット
- Conventional Commits + 日本語（例: `feat(rooms): GET /api/rooms エンドポイントを追加`）。
- レイヤー単位でコミットを分割し、失敗中のチェック状態ではコミットしない。
- 既存変更が混在する場合は、今回の対象ファイルだけを stage する。

## 3. Frontend 実装
1. `apps/frontend/app/`（Next.js App Router）配下で作業。`(authenticated)` などのレイアウト構造を尊重。
2. バリデーションは `@backend/infrastructure/validators/...` から共有。
3. Client Component は `'use client'` + `react-hook-form` + `zodResolver` を使用。
4. API 呼び出し時は `resolveAuth` / `buildContentFetchHeaders` など既存 helper を使い、`access_token` / `x-event-id` 契約を順守。

## 4. Frontend チェック & コミット
```bash
cd apps/frontend
bun run type-check
bun run lint
bun run test
```
通過後に日本語 Conventional Commit でフロント変更を記録（例: `feat(home): 認証済みホームを追加`）。

## 5. プルリクエスト
```bash
git push -u origin <branch>
gh pr create --base develop --title "<prefix>(<scope>): <日本語タイトル>"
```
`.github/pull_request_template.md` に準拠して日本語で記入。ターゲットは `develop` 固定。

## 6. 完了チェックリスト
- [ ] ブランチは `develop` から切ったか
- [ ] Backend `type-check` / `lint` / `test` ✅
- [ ] Frontend `type-check` / `lint` / `test` ✅
- [ ] コミットメッセージ: 日本語 + Conventional Commits
- [ ] PR タイトル・本文: 日本語 + テンプレ準拠
- [ ] Backend を終えてから Frontend を実装した
- [ ] `git status` で意図しない差分が混ざっていない
