import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import { ShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/ShopItemRepository';
import { getShopItems } from '@backend/src/presentation/controllers/shopItemController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { GetShopItemsUseCase } from '@backend/src/use-cases/shop-item/GetShopItemsUseCase';
import { Hono } from 'hono';

type ShopItemRepositoryFactory = (env: Env) => IShopItemRepository;

export function createShopItemRoutes(
    repositoryFactory: ShopItemRepositoryFactory = (env) =>
        new ShopItemRepository(createDatabaseClient(env)),
) {
    return new Hono<{ Bindings: Env }>().get(
        '/shop-items',
        contentAccessMiddleware,
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new GetShopItemsUseCase(repository);
            return getShopItems(c, useCase);
        },
    );
}
