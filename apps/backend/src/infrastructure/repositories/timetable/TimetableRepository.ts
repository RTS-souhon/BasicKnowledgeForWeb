import type { createDatabaseClient } from '@backend/src/db/connection';
import { timetableItems } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
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

    async search(keyword: string, eventId: string): Promise<TimetableItem[]> {
        const pattern = createIlikePattern(keyword);
        return this.db
            .select()
            .from(timetableItems)
            .where(
                and(
                    eq(timetableItems.eventId, eventId),
                    or(
                        ilike(timetableItems.title, pattern),
                        ilike(timetableItems.location, pattern),
                        ilike(timetableItems.description, pattern),
                    ),
                ),
            )
            .orderBy(asc(timetableItems.startTime));
    }
}
