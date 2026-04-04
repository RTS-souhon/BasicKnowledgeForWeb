import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    GetOtherItemsResult,
    IGetOtherItemsUseCase,
} from './IGetOtherItemsUseCase';

export class GetOtherItemsUseCase implements IGetOtherItemsUseCase {
    constructor(private readonly otherItemRepository: IOtherItemRepository) {}

    async execute(eventId: string): Promise<GetOtherItemsResult> {
        try {
            const data = await this.otherItemRepository.findByEventId(eventId);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'その他情報の取得中にエラーが発生しました',
            };
        }
    }
}
