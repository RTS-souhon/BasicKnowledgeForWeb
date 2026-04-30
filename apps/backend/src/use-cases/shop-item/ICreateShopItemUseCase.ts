import type { ShopItem } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';

export type CreateShopItemInput = {
    eventId: string;
    name: string;
    price: number;
    description?: string | null;
    imageKey: string;
};

export type CreateShopItemResult =
    | { success: true; data: ShopItem }
    | { success: false; error: string; status?: number };

export interface ICreateShopItemUseCase {
    execute(input: CreateShopItemInput): Promise<CreateShopItemResult>;
}
