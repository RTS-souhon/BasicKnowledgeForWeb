import type { createDatabaseClient } from '@backend/src/db/connection';
import { otherItems } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type {
    CreateOtherItemInput,
    IOtherItemRepository,
    OtherItem,
    UpdateOtherItemInput,
} from './IOtherItemRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class OtherItemRepository implements IOtherItemRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<OtherItem[]> {
        return this.db
            .select()
            .from(otherItems)
            .where(eq(otherItems.eventId, eventId))
            .orderBy(asc(otherItems.displayOrder));
    }

    async search(keyword: string, eventId: string): Promise<OtherItem[]> {
        const pattern = createIlikePattern(keyword);
        return this.db
            .select()
            .from(otherItems)
            .where(
                and(
                    eq(otherItems.eventId, eventId),
                    or(
                        ilike(otherItems.title, pattern),
                        ilike(otherItems.content, pattern),
                    ),
                ),
            )
            .orderBy(asc(otherItems.displayOrder));
    }
    async create(input: CreateOtherItemInput): Promise<OtherItem> {
        const [created] = await this.db
            .insert(otherItems)
            .values(input)
            .returning();
        return created;
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateOtherItemInput,
    ): Promise<OtherItem | null> {
        const [updated] = await this.db
            .update(otherItems)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(otherItems.id, id), eq(otherItems.eventId, eventId)))
            .returning();
        return updated ?? null;
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(otherItems)
            .where(and(eq(otherItems.id, id), eq(otherItems.eventId, eventId)))
            .returning({ id: otherItems.id });
        return deleted.length > 0;
    }
}
