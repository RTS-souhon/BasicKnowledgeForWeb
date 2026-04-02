import type { createDatabaseClient } from '@backend/src/db/connection';
import { programs } from '@backend/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { IProgramRepository, Program } from './IProgramRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class ProgramRepository implements IProgramRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<Program[]> {
        return this.db
            .select()
            .from(programs)
            .where(eq(programs.eventId, eventId))
            .orderBy(asc(programs.startTime));
    }
}
