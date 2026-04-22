---
name: frontend-overview
description: apps/frontend (Next.js 15 + OpenNext) の構成とワークフローを俯瞰し、開発・テスト・認証連携の要点をまとめる。
---

# スキル: frontend-overview

## 概要
`apps/frontend`（Next.js 15 App Router + OpenNext）で開発するときの要点集。開発コマンド、レイアウト/ミドルウェア構成、認証連携、MSW テスト運用をまとめる。

## 利用タイミング
- `apps/frontend/app/**` 配下の機能を新規実装・改修するとき。
- middleware / layout / header / page 間で `event_id` や認証情報の流れを確認したいとき。
- Jest + Testing Library + MSW テストを追加・修正するとき。

## 主要コマンド
```
cd apps/frontend
bun run dev              # OpenNext + Wrangler 開発サーバー (:8771)
bun run build            # Next.js build
bun run build:cloudflare # Cloudflare 向けビルド
bun run type-check
bun run lint             # Biome
bun run test             # Jest（--forceExit）
```

## アーキテクチャメモ
- App Router の `(authenticated)` グループを中心に、middleware でクッキー認証を強制する。
- API クライアントは `app/utils/client.ts` の Hono `hc<AppType>` を共通利用する。
- `app/lib/serverAuth.ts` で `auth_token` / `access_token` を解決し、`cookies()` の直接利用を分散させない。
- ナビゲーションは `components/AuthHeader.tsx` + `EventSelector.tsx` を基準にし、admin 向けの `event_id` クエリを維持する。
- backend 呼び出しは `buildContentFetchHeaders` 経由で `Cookie` と `x-event-id` を必ず付与する。

## テスト
- Jest 設定で MSW と polyfill は組み込み済み。テストは `apps/frontend/tests/**` に追加する。
- Server Component のテストでは `@frontend/app/lib/serverAuth` を先にモックし、`cookies()` を直接呼ばない。
- Client Component の描画時は `tests/helpers` の router helper を利用してコンテキストを補う。
- `bun run test` の open-handle 警告は MSW 起因で、既知の範囲なら許容する。

## 実装チェックリスト
1. 新規 API が必要な場合は先に backend を実装する（AGENTS.md の実装順序に従う）。
2. Server Component では `resolveAuth` と fetch helper を使って実装する。
3. クエリ伝播が必要な変更では header/nav も合わせて更新する。
4. `apps/frontend/tests/**` のテストを追加・更新する。
5. `bun run type-check && bun run test && bun run lint` を通す。
6. 日本語 Conventional Commits でコミットする。

## 補足
- バリデーションは重複定義せず、`@backend/...` の共有 schema を優先する。
- Tailwind クラス順は Biome の `useSortedClasses` 警告に従って整理する。
- ローカル開発の API ベース URL は `NEXT_PUBLIC_API_URL=http://localhost:8080` を基準にする。
- admin フローでは URL の `event_id` を維持し、user フローでは `access_token` payload を利用する。
