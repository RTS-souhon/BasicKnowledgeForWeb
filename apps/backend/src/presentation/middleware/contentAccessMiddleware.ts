import type { Env } from '@backend/src/db/connection';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

/**
 * コンテンツ閲覧用ミドルウェア。
 * access_token（アクセスコード認証）または auth_token（JWT ログイン）の
 * どちらかが有効であればリクエストを通過させる。
 */
export const contentAccessMiddleware = createMiddleware<{
    Bindings: Env;
}>(async (c, next) => {
    const accessToken = getCookie(c, 'access_token');
    const authToken = getCookie(c, 'auth_token');

    const token = accessToken ?? authToken;
    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    try {
        await verify(token, c.env.JWT_SECRET, 'HS256');
        await next();
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
});
