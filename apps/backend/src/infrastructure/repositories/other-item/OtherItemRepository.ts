import type { createDatabaseClient } from '@backend/src/db/connection';
import { otherItems } from '@backend/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { IOtherItemRepository, OtherItem } from './IOtherItemRepository';

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
}
