import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import { OtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/OtherItemRepository';
import { getOtherItems } from '@backend/src/presentation/controllers/otherItemController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { GetOtherItemsUseCase } from '@backend/src/use-cases/other-item/GetOtherItemsUseCase';
import { Hono } from 'hono';

type OtherItemRepositoryFactory = (env: Env) => IOtherItemRepository;

export function createOtherItemRoutes(
    repositoryFactory: OtherItemRepositoryFactory = (env) =>
        new OtherItemRepository(createDatabaseClient(env)),
) {
    return new Hono<{ Bindings: Env }>().get(
        '/others',
        contentAccessMiddleware,
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new GetOtherItemsUseCase(repository);
            return getOtherItems(c, useCase);
        },
    );
}
