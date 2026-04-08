import type { shopItems } from '@backend/src/db/schema';

export type ShopItem = Omit<typeof shopItems.$inferSelect, 'imageKey'>;

export interface IShopItemRepository {
    findByEventId(eventId: string): Promise<ShopItem[]>;
}
