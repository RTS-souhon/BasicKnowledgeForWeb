import type {
    IShopItemRepository,
    UpdateShopItemInput as RepositoryUpdateShopItemInput,
} from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type {
    IUpdateShopItemUseCase,
    UpdateShopItemInput,
    UpdateShopItemResult,
} from './IUpdateShopItemUseCase';

const SHOP_ITEM_PREFIX = 'shop-items';

export class UpdateShopItemUseCase implements IUpdateShopItemUseCase {
    constructor(private readonly shopItemRepository: IShopItemRepository) {}

    async execute(input: UpdateShopItemInput): Promise<UpdateShopItemResult> {
        const payload: RepositoryUpdateShopItemInput = {};
        if (input.payload.name !== undefined) {
            payload.name = input.payload.name;
        }
        if (input.payload.price !== undefined) {
            payload.price = input.payload.price;
        }
        if (input.payload.stockStatus !== undefined) {
            payload.stockStatus = input.payload.stockStatus;
        }
        if (input.payload.description !== undefined) {
            payload.description = input.payload.description;
        }
        if (input.payload.imageKey !== undefined) {
            if (!this.isKeyAllowed(input.payload.imageKey, input.eventId)) {
                return {
                    success: false,
                    error: 'image_key が許可されたプレフィックスではありません',
                    status: 400,
                };
            }
            payload.imageKey = input.payload.imageKey;
        }
        if (input.payload.imageUrl !== undefined) {
            payload.imageUrl = input.payload.imageUrl;
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.shopItemRepository.update(
                input.id,
                input.eventId,
                payload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: '販売物が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: '販売物の更新中にエラーが発生しました',
                status: 500,
            };
        }
    }

    private isKeyAllowed(key: string, eventId: string) {
        return key.startsWith(`${SHOP_ITEM_PREFIX}/${eventId}/`);
    }
}
