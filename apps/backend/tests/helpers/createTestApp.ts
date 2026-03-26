import { Hono } from 'hono';
import type { IHealthRepository } from '@/infrastructure/repositories/health/IHealthRepository';
import type { IUserRepository } from '@/infrastructure/repositories/user/IUserRepository';
import { createHealthRoutes } from '@/presentation/routes/healthRoutes';
import { createUserRoutes } from '@/presentation/routes/userRoutes';
import type { Env } from '@/db/connection';

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
