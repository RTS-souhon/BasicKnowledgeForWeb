import type { shopItems } from '@backend/src/db/schema';

type ShopItemRecord = typeof shopItems.$inferSelect;

export type ShopItem = Omit<ShopItemRecord, 'imageKey'>;

export type CreateShopItemInput = Omit<
    typeof shopItems.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateShopItemInput = Partial<
    Omit<
        typeof shopItems.$inferInsert,
        'id' | 'eventId' | 'createdAt' | 'updatedAt'
    >
>;

export interface IShopItemRepository {
    findByEventId(eventId: string): Promise<ShopItem[]>;
    search(keyword: string, eventId: string): Promise<ShopItem[]>;
    create(input: CreateShopItemInput): Promise<ShopItem>;
    update(
        id: string,
        eventId: string,
        input: UpdateShopItemInput,
    ): Promise<ShopItem | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
