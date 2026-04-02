import type { shopItems } from '@backend/src/db/schema';

export type ShopItem = typeof shopItems.$inferSelect;

export interface IShopItemRepository {
    findByEventId(eventId: string): Promise<ShopItem[]>;
}
