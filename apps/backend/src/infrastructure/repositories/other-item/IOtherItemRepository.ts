import type { otherItems } from '@backend/src/db/schema';

export type OtherItem = typeof otherItems.$inferSelect;

export interface IOtherItemRepository {
    findByEventId(eventId: string): Promise<OtherItem[]>;
    search(keyword: string, eventId: string): Promise<OtherItem[]>;
}
