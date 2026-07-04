import type { timetableItems } from '@backend/src/db/schema';

export type TimetableDepartment = {
    id: string;
    name: string;
};

export type TimetableItem = typeof timetableItems.$inferSelect & {
    departments: TimetableDepartment[];
};

export type CreateTimetableItemInput = Omit<
    typeof timetableItems.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
> & {
    departmentIds?: string[];
};

export type UpdateTimetableItemInput = Partial<
    Omit<
        typeof timetableItems.$inferInsert,
        'id' | 'eventId' | 'createdAt' | 'updatedAt'
    >
> & {
    departmentIds?: string[];
};

export interface ITimetableRepository {
    findByEventId(eventId: string): Promise<TimetableItem[]>;
    findById(id: string, eventId: string): Promise<TimetableItem | null>;
    search(keyword: string, eventId: string): Promise<TimetableItem[]>;
    create(input: CreateTimetableItemInput): Promise<TimetableItem>;
    update(
        id: string,
        eventId: string,
        input: UpdateTimetableItemInput,
    ): Promise<TimetableItem | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
