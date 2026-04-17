import type { ITimetableRepository } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import type {
    CreateTimetableItemInput,
    CreateTimetableItemResult,
    ICreateTimetableItemUseCase,
} from './ICreateTimetableItemUseCase';

export class CreateTimetableItemUseCase implements ICreateTimetableItemUseCase {
    constructor(private readonly timetableRepository: ITimetableRepository) {}

    async execute(
        input: CreateTimetableItemInput,
    ): Promise<CreateTimetableItemResult> {
        const start = new Date(input.startTime);

        try {
            const data = await this.timetableRepository.create({
                eventId: input.eventId,
                title: input.title,
                startTime: start,
                endTime: start,
                location: input.location,
                description: input.description ?? null,
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'タイムテーブルの作成中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
