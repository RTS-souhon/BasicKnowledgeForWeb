import type { createDatabaseClient } from '@backend/src/db/connection';
import { shopItems } from '@backend/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { IShopItemRepository, ShopItem } from './IShopItemRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class ShopItemRepository implements IShopItemRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<ShopItem[]> {
        return this.db
            .select({
                id: shopItems.id,
                eventId: shopItems.eventId,
                name: shopItems.name,
                price: shopItems.price,
                stockStatus: shopItems.stockStatus,
                description: shopItems.description,
                imageUrl: shopItems.imageUrl,
                createdAt: shopItems.createdAt,
                updatedAt: shopItems.updatedAt,
            })
            .from(shopItems)
            .where(eq(shopItems.eventId, eventId))
            .orderBy(asc(shopItems.name));
    }
}
