import type { ITimetableRepository } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import type {
    GetTimetableItemsResult,
    IGetTimetableItemsUseCase,
} from './IGetTimetableItemsUseCase';

export class GetTimetableItemsUseCase implements IGetTimetableItemsUseCase {
    constructor(private readonly timetableRepository: ITimetableRepository) {}

    async execute(eventId: string): Promise<GetTimetableItemsResult> {
        try {
            const data = await this.timetableRepository.findByEventId(eventId);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'タイムテーブルの取得中にエラーが発生しました',
            };
        }
    }
}
