import type {
    IOtherItemRepository,
    UpdateOtherItemInput as RepositoryUpdateOtherItemInput,
} from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    IUpdateOtherItemUseCase,
    UpdateOtherItemInput,
    UpdateOtherItemResult,
} from './IUpdateOtherItemUseCase';

export class UpdateOtherItemUseCase implements IUpdateOtherItemUseCase {
    constructor(private readonly otherItemRepository: IOtherItemRepository) {}

    async execute(input: UpdateOtherItemInput): Promise<UpdateOtherItemResult> {
        const payload: RepositoryUpdateOtherItemInput = {};
        if (input.payload.title !== undefined) {
            payload.title = input.payload.title;
        }
        if (input.payload.content !== undefined) {
            payload.content = input.payload.content;
        }
        if (input.payload.displayOrder !== undefined) {
            payload.displayOrder = input.payload.displayOrder;
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.otherItemRepository.update(
                input.id,
                input.eventId,
                payload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: 'その他情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: 'その他情報の更新中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
