import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import { OtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/OtherItemRepository';
import {
    createOtherItem,
    deleteOtherItem,
    getOtherItems,
    updateOtherItem,
} from '@backend/src/presentation/controllers/otherItemController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { contentEditMiddleware } from '@backend/src/presentation/middleware/contentEditMiddleware';
import { roleGuard } from '@backend/src/presentation/middleware/roleGuard';
import { CreateOtherItemUseCase } from '@backend/src/use-cases/other-item/CreateOtherItemUseCase';
import { DeleteOtherItemUseCase } from '@backend/src/use-cases/other-item/DeleteOtherItemUseCase';
import { GetOtherItemsUseCase } from '@backend/src/use-cases/other-item/GetOtherItemsUseCase';
import { UpdateOtherItemUseCase } from '@backend/src/use-cases/other-item/UpdateOtherItemUseCase';
import { Hono } from 'hono';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

type OtherItemRepositoryFactory = (env: Env) => IOtherItemRepository;

export function createOtherItemRoutes(
    repositoryFactory: OtherItemRepositoryFactory = (env) =>
        new OtherItemRepository(createDatabaseClient(env)),
) {
    const app = new Hono<{ Bindings: Env; Variables: ContentEditVariables }>();
    const ADMIN_ROLES = ['admin'];

    app.get('/others', contentAccessMiddleware, async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new GetOtherItemsUseCase(repository);
        return getOtherItems(c, useCase);
    });

    app.post(
        '/others',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new CreateOtherItemUseCase(repository);
            return createOtherItem(c, useCase);
        },
    );

    app.put(
        '/others/:id',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new UpdateOtherItemUseCase(repository);
            return updateOtherItem(c, useCase);
        },
    );

    app.delete(
        '/others/:id',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new DeleteOtherItemUseCase(repository);
            return deleteOtherItem(c, useCase);
        },
    );

    return app;
}
