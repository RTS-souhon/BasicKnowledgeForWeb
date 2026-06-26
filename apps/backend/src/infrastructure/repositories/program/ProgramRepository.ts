import type { createDatabaseClient } from '@backend/src/db/connection';
import { programs } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import type {
    CreateProgramInput,
    IProgramRepository,
    Program,
    UpdateProgramInput,
} from './IProgramRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class ProgramRepository implements IProgramRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<Program[]> {
        return this.db
            .select({
                id: programs.id,
                eventId: programs.eventId,
                name: programs.name,
                location: programs.location,
                startTime: programs.startTime,
                endTime: programs.endTime,
                description: programs.description,
                imageUrl: programs.imageUrl,
                createdAt: programs.createdAt,
                updatedAt: programs.updatedAt,
            })
            .from(programs)
            .where(eq(programs.eventId, eventId))
            .orderBy(asc(programs.startTime));
    }

    async findById(id: string, eventId: string): Promise<Program | null> {
        const [item] = await this.db
            .select()
            .from(programs)
            .where(and(eq(programs.id, id), eq(programs.eventId, eventId)))
            .limit(1);
        return item ?? null;
    }

    async search(keyword: string, eventId: string): Promise<Program[]> {
        const pattern = createIlikePattern(keyword);
        return this.db
            .select({
                id: programs.id,
                eventId: programs.eventId,
                name: programs.name,
                location: programs.location,
                startTime: programs.startTime,
                endTime: programs.endTime,
                description: programs.description,
                imageUrl: programs.imageUrl,
                createdAt: programs.createdAt,
                updatedAt: programs.updatedAt,
            })
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

    async create(input: CreateProgramInput): Promise<Program> {
        const [created] = await this.db
            .insert(programs)
            .values(input)
            .returning();
        return this.mapRecord(created);
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateProgramInput,
    ): Promise<Program | null> {
        const [updated] = await this.db
            .update(programs)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(programs.id, id), eq(programs.eventId, eventId)))
            .returning();
        return updated ? this.mapRecord(updated) : null;
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(programs)
            .where(and(eq(programs.id, id), eq(programs.eventId, eventId)))
            .returning({ id: programs.id });
        return deleted.length > 0;
    }

    private mapRecord(record: typeof programs.$inferSelect): Program {
        const { imageKey: _imageKey, ...rest } = record;
        return rest;
    }
}
