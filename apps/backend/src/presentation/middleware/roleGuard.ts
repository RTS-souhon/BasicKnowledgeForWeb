import type { Env } from '@backend/src/db/connection';
import { createMiddleware } from 'hono/factory';
import type { AuthVariables } from './authMiddleware';

export function roleGuard(allowedRoles: string[]) {
    return createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
        async (c, next) => {
            const user = c.get('user');
            if (!user || !allowedRoles.includes(user.role)) {
                return c.json({ error: 'Forbidden' }, 403);
            }
            await next();
        },
    );
}
