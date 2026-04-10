import type { ShopItem } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';

export type UpdateShopItemInput = {
    id: string;
    eventId: string;
    payload: {
        name?: string;
        price?: number;
        stockStatus?: 'available' | 'low' | 'sold_out';
        description?: string | null;
        imageKey?: string;
    };
};

export type UpdateShopItemResult =
    | { success: true; data: ShopItem }
    | { success: false; error: string; status?: number };

export interface IUpdateShopItemUseCase {
    execute(input: UpdateShopItemInput): Promise<UpdateShopItemResult>;
}
