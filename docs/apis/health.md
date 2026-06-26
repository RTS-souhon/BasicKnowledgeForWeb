# Health API `GET /api/health`

## 概要
- Backend の稼働状態と DB 接続状態を確認するヘルスチェック API。
- 認証不要で利用できる。

## エンドポイント
- `GET /api/health`

## レスポンス

### 成功（DB 接続 OK）
- ステータス: `200`
- ボディ:
```json
{
  "status": "ok",
  "db": "connected"
}
```

### 失敗（DB 接続 NG）
- ステータス: `503`
- ボディ:
```json
{
  "status": "error",
  "db": "disconnected"
}
```

## 実装
- Route: `apps/backend/src/presentation/routes/healthRoutes.ts`
- Controller: `apps/backend/src/presentation/controllers/healthController.ts`
- UseCase: `apps/backend/src/use-cases/health/CheckDatabaseHealthUseCase.ts`
