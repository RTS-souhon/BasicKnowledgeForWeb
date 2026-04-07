import type { createDatabaseClient } from '@backend/src/db/connection';
import { shopItems } from '@backend/src/db/schema';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type { IShopItemRepository, ShopItem } from './IShopItemRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class ShopItemRepository implements IShopItemRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<ShopItem[]> {
        return this.db
            .select()
            .from(shopItems)
            .where(eq(shopItems.eventId, eventId))
            .orderBy(asc(shopItems.name));
    }

    async search(keyword: string, eventId: string): Promise<ShopItem[]> {
        const pattern = `%${keyword}%`;
        return this.db
            .select()
            .from(shopItems)
            .where(
                and(
                    eq(shopItems.eventId, eventId),
                    or(
                        ilike(shopItems.name, pattern),
                        ilike(shopItems.description, pattern),
                    ),
                ),
            )
            .orderBy(asc(shopItems.name));
    }
}
