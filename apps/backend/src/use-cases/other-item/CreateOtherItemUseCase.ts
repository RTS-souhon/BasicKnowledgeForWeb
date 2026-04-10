import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    CreateOtherItemInput,
    CreateOtherItemResult,
    ICreateOtherItemUseCase,
} from './ICreateOtherItemUseCase';

export class CreateOtherItemUseCase implements ICreateOtherItemUseCase {
    constructor(private readonly otherItemRepository: IOtherItemRepository) {}

    async execute(input: CreateOtherItemInput): Promise<CreateOtherItemResult> {
        try {
            const data = await this.otherItemRepository.create({
                eventId: input.eventId,
                title: input.title,
                content: input.content,
                displayOrder: input.displayOrder,
                createdBy: input.createdBy,
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'その他情報の作成中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
