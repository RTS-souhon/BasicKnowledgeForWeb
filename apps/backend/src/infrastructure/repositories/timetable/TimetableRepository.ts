import type { createDatabaseClient } from '@backend/src/db/connection';
import { timetableItems } from '@backend/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import type {
    ITimetableRepository,
    TimetableItem,
} from './ITimetableRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class TimetableRepository implements ITimetableRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<TimetableItem[]> {
        return this.db
            .select()
            .from(timetableItems)
            .where(eq(timetableItems.eventId, eventId))
            .orderBy(asc(timetableItems.startTime));
    }
}
