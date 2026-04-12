import type { ShopItem } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';

export type GetShopItemsResult =
    | { success: true; data: ShopItem[] }
    | { success: false; error: string };

export interface IGetShopItemsUseCase {
    execute(eventId: string): Promise<GetShopItemsResult>;
}
