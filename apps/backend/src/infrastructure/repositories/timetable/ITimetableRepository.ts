import type { timetableItems } from '@backend/src/db/schema';

export type TimetableItem = typeof timetableItems.$inferSelect;

export interface ITimetableRepository {
    findByEventId(eventId: string): Promise<TimetableItem[]>;
    search(keyword: string, eventId: string): Promise<TimetableItem[]>;
}
