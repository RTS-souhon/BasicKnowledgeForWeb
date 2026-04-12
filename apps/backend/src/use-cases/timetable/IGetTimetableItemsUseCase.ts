import type { TimetableItem } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';

export type GetTimetableItemsResult =
    | { success: true; data: TimetableItem[] }
    | { success: false; error: string };

export interface IGetTimetableItemsUseCase {
    execute(eventId: string): Promise<GetTimetableItemsResult>;
}
