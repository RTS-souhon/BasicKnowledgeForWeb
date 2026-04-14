import type { createDatabaseClient } from '@backend/src/db/connection';
import { departments } from '@backend/src/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import type {
    CreateDepartmentInput,
    Department,
    IDepartmentRepository,
    UpdateDepartmentInput,
} from './IDepartmentRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class DepartmentRepository implements IDepartmentRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<Department[]> {
        return this.db
            .select()
            .from(departments)
            .where(eq(departments.eventId, eventId))
            .orderBy(asc(departments.name));
    }

    async create(input: CreateDepartmentInput): Promise<Department> {
        const [created] = await this.db
            .insert(departments)
            .values(input)
            .returning();
        return created;
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateDepartmentInput,
    ): Promise<Department | null> {
        const [updated] = await this.db
            .update(departments)
            .set({ ...input, updatedAt: new Date() })
            .where(
                and(eq(departments.id, id), eq(departments.eventId, eventId)),
            )
            .returning();
        return updated ?? null;
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(departments)
            .where(
                and(eq(departments.id, id), eq(departments.eventId, eventId)),
            )
            .returning({ id: departments.id });
        return deleted.length > 0;
    }
}
