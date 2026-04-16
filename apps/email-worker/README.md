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
- 認証: `Authorization: Bearer <INTERNAL_API_TOKEN>`

### Request body

```json
{
  "to": "user@example.com",
  "template": "email_verification",
  "code": "123456"
}
```

`template` は `email_verification` または `login_otp` を受け付けます。
