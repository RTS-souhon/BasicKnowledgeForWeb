# Email Worker

Cloudflare Email Routing / SendEmail を扱う専用 Worker です。

## Scripts

```bash
bun run dev
bun run lint
bun run type-check
bun run test
```

## Internal API

- `POST /internal/email/send`
- 認可: Cloudflare Service Binding (`EMAIL_WORKER`) 経由のみ

## Worker Visibility

```bash
workers_dev = false
```

公開 URL を持たない Worker としてデプロイし、backend Worker からの service binding 呼び出し専用で利用します。

### Request body

```json
{
  "to": "user@example.com",
  "template": "email_verification",
  "code": "123456"
}
```

`template` は `email_verification` または `login_otp` を受け付けます。
