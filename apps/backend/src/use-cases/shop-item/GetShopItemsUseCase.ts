import type { IShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type {
    GetShopItemsResult,
    IGetShopItemsUseCase,
} from './IGetShopItemsUseCase';

export class GetShopItemsUseCase implements IGetShopItemsUseCase {
    constructor(private readonly shopItemRepository: IShopItemRepository) {}

    async execute(eventId: string): Promise<GetShopItemsResult> {
        try {
            const data = await this.shopItemRepository.findByEventId(eventId);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '販売物一覧の取得中にエラーが発生しました',
            };
        }
    }
}
