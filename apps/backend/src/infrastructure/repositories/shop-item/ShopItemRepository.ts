import type { createDatabaseClient } from '@backend/src/db/connection';
import { shopItems } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type {
    CreateShopItemInput,
    IShopItemRepository,
    ShopItem,
    UpdateShopItemInput,
} from './IShopItemRepository';

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

    async search(keyword: string, eventId: string): Promise<ShopItem[]> {
        const pattern = createIlikePattern(keyword);
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

    async create(input: CreateShopItemInput): Promise<ShopItem> {
        const [created] = await this.db
            .insert(shopItems)
            .values(input)
            .returning();
        return this.mapRecord(created);
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateShopItemInput,
    ): Promise<ShopItem | null> {
        const [updated] = await this.db
            .update(shopItems)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(shopItems.id, id), eq(shopItems.eventId, eventId)))
            .returning();
        return updated ? this.mapRecord(updated) : null;
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(shopItems)
            .where(and(eq(shopItems.id, id), eq(shopItems.eventId, eventId)))
            .returning({ id: shopItems.id });
        return deleted.length > 0;
    }

    private mapRecord(record: typeof shopItems.$inferSelect): ShopItem {
        const { imageKey: _imageKey, ...rest } = record;
        return rest;
    }
}
