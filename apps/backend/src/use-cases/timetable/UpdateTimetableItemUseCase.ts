import type {
    ITimetableRepository,
    UpdateTimetableItemInput as RepositoryUpdateTimetableItemInput,
} from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import type {
    IUpdateTimetableItemUseCase,
    UpdateTimetableItemInput,
    UpdateTimetableItemResult,
} from './IUpdateTimetableItemUseCase';

export class UpdateTimetableItemUseCase implements IUpdateTimetableItemUseCase {
    constructor(private readonly timetableRepository: ITimetableRepository) {}

    async execute(
        input: UpdateTimetableItemInput,
    ): Promise<UpdateTimetableItemResult> {
        const updatePayload: RepositoryUpdateTimetableItemInput = {};
        if (input.payload.title !== undefined) {
            updatePayload.title = input.payload.title;
        }
        if (input.payload.startTime !== undefined) {
            const startTime = new Date(input.payload.startTime);
            updatePayload.startTime = startTime;
            updatePayload.endTime = startTime;
        }
        if (input.payload.location !== undefined) {
            updatePayload.location = input.payload.location;
        }
        if (input.payload.description !== undefined) {
            updatePayload.description = input.payload.description;
        }

        if (Object.keys(updatePayload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.timetableRepository.update(
                input.id,
                input.eventId,
                updatePayload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: 'タイムテーブルが見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: 'タイムテーブルの更新中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
