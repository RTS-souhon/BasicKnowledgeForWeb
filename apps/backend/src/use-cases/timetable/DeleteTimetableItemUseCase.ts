import type { ITimetableRepository } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import type {
    DeleteTimetableItemInput,
    DeleteTimetableItemResult,
    IDeleteTimetableItemUseCase,
} from './IDeleteTimetableItemUseCase';

export class DeleteTimetableItemUseCase implements IDeleteTimetableItemUseCase {
    constructor(private readonly timetableRepository: ITimetableRepository) {}

    async execute(
        input: DeleteTimetableItemInput,
    ): Promise<DeleteTimetableItemResult> {
        try {
            const deleted = await this.timetableRepository.delete(
                input.id,
                input.eventId,
            );
            if (!deleted) {
                return {
                    success: false,
                    error: 'タイムテーブルが見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: { id: input.id } };
        } catch {
            return {
                success: false,
                error: 'タイムテーブルの削除中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
