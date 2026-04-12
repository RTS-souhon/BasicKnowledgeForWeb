import type { IShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type {
    DeleteShopItemInput,
    DeleteShopItemResult,
    IDeleteShopItemUseCase,
} from './IDeleteShopItemUseCase';

export class DeleteShopItemUseCase implements IDeleteShopItemUseCase {
    constructor(private readonly shopItemRepository: IShopItemRepository) {}

    async execute(input: DeleteShopItemInput): Promise<DeleteShopItemResult> {
        try {
            const deleted = await this.shopItemRepository.delete(
                input.id,
                input.eventId,
            );
            if (!deleted) {
                return {
                    success: false,
                    error: '販売物が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: { id: input.id } };
        } catch {
            return {
                success: false,
                error: '販売物の削除中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
