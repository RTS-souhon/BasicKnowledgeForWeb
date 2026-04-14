import type { departments } from '@backend/src/db/schema';

export type Department = typeof departments.$inferSelect;

export type CreateDepartmentInput = Omit<
    typeof departments.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateDepartmentInput = Partial<
    Omit<
        typeof departments.$inferInsert,
        'id' | 'eventId' | 'createdAt' | 'updatedAt'
    >
>;

export interface IDepartmentRepository {
    findByEventId(eventId: string): Promise<Department[]>;
    create(input: CreateDepartmentInput): Promise<Department>;
    update(
        id: string,
        eventId: string,
        input: UpdateDepartmentInput,
    ): Promise<Department | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
