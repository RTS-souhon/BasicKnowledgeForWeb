import type { otherItems } from '@backend/src/db/schema';

type OtherItemRecord = typeof otherItems.$inferSelect;

export type OtherItem = Omit<OtherItemRecord, 'imageKey'>;

export type CreateOtherItemInput = Omit<
    typeof otherItems.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateOtherItemInput = Partial<
    Omit<
        typeof otherItems.$inferInsert,
        'id' | 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'
    >
>;

export interface IOtherItemRepository {
    findByEventId(eventId: string): Promise<OtherItem[]>;
    search(keyword: string, eventId: string): Promise<OtherItem[]>;
    create(input: CreateOtherItemInput): Promise<OtherItem>;
    update(
        id: string,
        eventId: string,
        input: UpdateOtherItemInput,
    ): Promise<OtherItem | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
