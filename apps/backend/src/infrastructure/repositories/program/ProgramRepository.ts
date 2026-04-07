import type { createDatabaseClient } from '@backend/src/db/connection';
import { programs } from '@backend/src/db/schema';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
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

    async search(keyword: string, eventId: string): Promise<Program[]> {
        const pattern = `%${keyword}%`;
        return this.db
            .select()
            .from(programs)
            .where(
                and(
                    eq(programs.eventId, eventId),
                    or(
                        ilike(programs.name, pattern),
                        ilike(programs.location, pattern),
                        ilike(programs.description, pattern),
                    ),
                ),
            )
            .orderBy(asc(programs.startTime));
    }
}
