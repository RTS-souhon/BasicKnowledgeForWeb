import type { Env } from '@backend/src/db/connection';
import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type { IHealthRepository } from '@backend/src/infrastructure/repositories/health/IHealthRepository';
import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { createAccessCodeRoutes } from '@backend/src/presentation/routes/accessCodeRoutes';
import { createAuthRoutes } from '@backend/src/presentation/routes/authRoutes';
import { createHealthRoutes } from '@backend/src/presentation/routes/healthRoutes';
import { createUserRoutes } from '@backend/src/presentation/routes/userRoutes';
import { Hono } from 'hono';

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

export function createTestAppWithAuth(
    userRepository: IUserRepository,
) {
    const app = new Hono<{ Bindings: Env }>();
    app.route('/api', createAuthRoutes(() => userRepository));
    return app;
}

export function createTestAppWithAccessCodes(
    accessCodeRepository: IAccessCodeRepository,
) {
    const app = new Hono<{ Bindings: Env }>();
    app.route('/api', createAccessCodeRoutes(() => accessCodeRepository));
    return app;
}
