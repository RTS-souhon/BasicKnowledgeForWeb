import type { Env } from '@backend/src/db/connection';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export type AuthVariables = {
    user: AuthUser;
};

export const authMiddleware = createMiddleware<{
    Bindings: Env;
    Variables: AuthVariables;
}>(async (c, next) => {
    const token = getCookie(c, 'auth_token');
    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    try {
        const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
        c.set('user', payload as AuthUser);
        await next();
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
});
