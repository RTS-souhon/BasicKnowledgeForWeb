---
name: docs-pages-maintenance
description: docs/pages の仕様書を現行実装に同期・更新するときに使う。API契約、認証/権限、画面分岐、連番ファイル名と参照更新までを最短で実施する。
---

# docs/pages 同期ガイド

参照: `CLAUDE.md`, `apps/backend/src/presentation/**/*.ts`, `apps/frontend/app/**/*.tsx`, `apps/frontend/app/actions/*.ts`

## 目的
- `docs/pages/*.md` を実装準拠で保つ。
- API 契約・認証条件・画面分岐のズレを防ぐ。
- ページ連番や参照リンク変更の漏れを防ぐ。

## 現行ページ順（2026-04 時点）
1. `01-login.md`
2. `02-register.md`
3. `03-access.md`
4. `04-home.md`
5. `05-timetable.md`
6. `06-rooms.md`
7. `07-events.md`
8. `08-shop.md`
9. `09-search.md`
10. `10-dashboard.md`
11. `11-admin-access-code.md`
12. `12-departments.md`
13. `13-others.md`（`others` は最後）

## 最短手順
1. **対象の実装を確認**
   - backend: `routes` / `controllers` / `validators` / `middleware`
   - frontend: `page.tsx` / `actions/*.ts` / `lib/serverAuth.ts`
2. **仕様差分を確定**
   - エンドポイント、リクエスト/レスポンス、ステータスコード
   - 認証方式（`access_token` / `auth_token`）と `x-event-id`
   - `admin` / `user` の表示分岐
3. **`docs/pages/*.md` を更新**
   - 旧表記を排除（`Admin/Developer` など）
   - 実装と一致する URL・フィールド名に統一
4. **連番/ファイル名を調整（必要時）**
   - `others` を最後に維持
   - リネーム時は参照元（主に `docs/tasks/*.md`）を同時更新
5. **差分チェック**
   - `rg -n "Admin/Developer|upload-url|/admin/access-code|\\?event_id=<id>" docs/pages docs/tasks`
   - `rg -n "docs/pages/.*others|docs/pages/.*departments" docs/tasks`

## 反映時の注意
- `event_id` クエリ運用と `x-event-id` ヘッダー運用を混在させない。
- 仕様書に「未来の理想」ではなく「現行実装」を書く。
- UI 文言よりも API 契約とアクセス制御の正確性を優先する。
