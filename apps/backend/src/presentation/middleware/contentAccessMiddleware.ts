import type { Env } from '@backend/src/db/connection';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

/**
 * コンテンツ閲覧用ミドルウェア。
 *
 * 以下のいずれかを満たす場合にリクエストを通過させる:
 * - access_token が有効、かつ JWT 内の event_id が x-event-id ヘッダーと一致する
 * - auth_token が有効、かつ role が admin である
 *
 * role=user の auth_token はコンテンツ API を通過できない（access_token が必要）。
 */
export const contentAccessMiddleware = createMiddleware<{
    Bindings: Env;
}>(async (c, next) => {
    const xEventId = c.req.header('x-event-id');
    const accessToken = getCookie(c, 'access_token');
    const authToken = getCookie(c, 'auth_token');

    // access_token 認証: JWT が有効かつ event_id が x-event-id と一致すること
    if (accessToken) {
        try {
            const payload = await verify(
                accessToken,
                c.env.JWT_SECRET,
                'HS256',
            );
            if (payload.event_id === xEventId) {
                await next();
                return;
            }
        } catch {
            // 次の認証方法へ
        }
    }

    // auth_token 認証: JWT が有効かつ role が admin であること
    if (authToken) {
        try {
            const payload = await verify(authToken, c.env.JWT_SECRET, 'HS256');
            const role = payload.role as string | undefined;
            if (role === 'admin') {
                await next();
                return;
            }
        } catch {
            // 次の処理へ
        }
    }

    return c.json({ error: 'Unauthorized' }, 401);
});
