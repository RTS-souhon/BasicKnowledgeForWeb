import { Hono } from 'hono';
import type { IHealthRepository } from '@backend/src/infrastructure/repositories/health/IHealthRepository';
import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { createHealthRoutes } from '@backend/src/presentation/routes/healthRoutes';
import { createUserRoutes } from '@backend/src/presentation/routes/userRoutes';
import type { Env } from '@backend/src/db/connection';

export function createTestAppWithHealth(
    healthRepository: IHealthRepository,
) {
    const app = new Hono<{ Bindings: Env }>();
    app.route('/api', createHealthRoutes(() => healthRepository));
    return app;
}

export function createTestAppWithUsers(
    userRepository: IUserRepository,
) {
    const app = new Hono<{ Bindings: Env }>();
    app.route('/api', createUserRoutes(() => userRepository));
    return app;
}
