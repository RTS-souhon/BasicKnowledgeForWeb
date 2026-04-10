import type { programs } from '@backend/src/db/schema';

export type Program = typeof programs.$inferSelect;

export type CreateProgramInput = Omit<
    typeof programs.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateProgramInput = Partial<
    Omit<
        typeof programs.$inferInsert,
        'id' | 'eventId' | 'createdAt' | 'updatedAt'
    >
>;

export interface IProgramRepository {
    findByEventId(eventId: string): Promise<Program[]>;
    findById(id: string, eventId: string): Promise<Program | null>;
    search(keyword: string, eventId: string): Promise<Program[]>;
    create(input: CreateProgramInput): Promise<Program>;
    update(
        id: string,
        eventId: string,
        input: UpdateProgramInput,
    ): Promise<Program | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
