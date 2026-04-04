import type { programs } from '@backend/src/db/schema';

export type Program = typeof programs.$inferSelect;

export interface IProgramRepository {
    findByEventId(eventId: string): Promise<Program[]>;
}
