import type { createDatabaseClient } from '@backend/src/db/connection';
import { timetableItems } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type {
    CreateTimetableItemInput,
    ITimetableRepository,
    TimetableItem,
    UpdateTimetableItemInput,
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

    async findById(id: string, eventId: string): Promise<TimetableItem | null> {
        const [item] = await this.db
            .select()
            .from(timetableItems)
            .where(
                and(
                    eq(timetableItems.id, id),
                    eq(timetableItems.eventId, eventId),
                ),
            )
            .limit(1);
        return item ?? null;
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

    async create(input: CreateTimetableItemInput): Promise<TimetableItem> {
        const [created] = await this.db
            .insert(timetableItems)
            .values(input)
            .returning();
        return created;
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateTimetableItemInput,
    ): Promise<TimetableItem | null> {
        const [updated] = await this.db
            .update(timetableItems)
            .set({ ...input, updatedAt: new Date() })
            .where(
                and(
                    eq(timetableItems.id, id),
                    eq(timetableItems.eventId, eventId),
                ),
            )
            .returning();
        return updated ?? null;
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(timetableItems)
            .where(
                and(
                    eq(timetableItems.id, id),
                    eq(timetableItems.eventId, eventId),
                ),
            )
            .returning({ id: timetableItems.id });
        return deleted.length > 0;
    }
}
