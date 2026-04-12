import type { IShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type {
    CreateShopItemInput,
    CreateShopItemResult,
    ICreateShopItemUseCase,
} from './ICreateShopItemUseCase';

const SHOP_ITEM_PREFIX = 'shop-items';

export class CreateShopItemUseCase implements ICreateShopItemUseCase {
    constructor(
        private readonly shopItemRepository: IShopItemRepository,
        private readonly assetBaseUrl: string,
    ) {}

    async execute(input: CreateShopItemInput): Promise<CreateShopItemResult> {
        if (!this.isKeyAllowed(input.imageKey, input.eventId)) {
            return {
                success: false,
                error: 'image_key が許可されたプレフィックスではありません',
                status: 400,
            };
        }

        try {
            const data = await this.shopItemRepository.create({
                eventId: input.eventId,
                name: input.name,
                price: input.price,
                stockStatus: input.stockStatus,
                description: input.description ?? null,
                imageKey: input.imageKey,
                imageUrl: this.buildImageUrl(input.imageKey),
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '販売物の作成中にエラーが発生しました',
                status: 500,
            };
        }
    }

    private isKeyAllowed(key: string, eventId: string) {
        return key.startsWith(`${SHOP_ITEM_PREFIX}/${eventId}/`);
    }

    private buildImageUrl(imageKey: string) {
        const trimmedBase = this.assetBaseUrl.replace(/\/+$/, '');
        return `${trimmedBase}/${imageKey}`;
    }
}
