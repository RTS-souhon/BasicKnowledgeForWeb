import { Hono } from 'hono';
import { createDatabaseClient, type Env } from '@/db/connection';
import { HealthRepository } from '@/infrastructure/repositories/health/HealthRepository';
import type { IHealthRepository } from '@/infrastructure/repositories/health/IHealthRepository';
import { checkHealth } from '@/presentation/controllers/healthController';
import { CheckDatabaseHealthUseCase } from '@/use-cases/health/CheckDatabaseHealthUseCase';

type HealthRepositoryFactory = (env: Env) => IHealthRepository;

export function createHealthRoutes(
    repositoryFactory: HealthRepositoryFactory = (env) =>
        new HealthRepository(createDatabaseClient(env)),
) {
    const app = new Hono<{ Bindings: Env }>();

    // GET /api/health - DB疎通確認
    app.get('/health', async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new CheckDatabaseHealthUseCase(repository);
        return checkHealth(c, useCase);
    });

    return app;
}
