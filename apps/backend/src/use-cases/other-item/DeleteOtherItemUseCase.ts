import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    DeleteOtherItemInput,
    DeleteOtherItemResult,
    IDeleteOtherItemUseCase,
} from './IDeleteOtherItemUseCase';

export class DeleteOtherItemUseCase implements IDeleteOtherItemUseCase {
    constructor(private readonly otherItemRepository: IOtherItemRepository) {}

    async execute(input: DeleteOtherItemInput): Promise<DeleteOtherItemResult> {
        try {
            const deleted = await this.otherItemRepository.delete(
                input.id,
                input.eventId,
            );
            if (!deleted) {
                return {
                    success: false,
                    error: 'その他情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: { id: input.id } };
        } catch {
            return {
                success: false,
                error: 'その他情報の削除中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
