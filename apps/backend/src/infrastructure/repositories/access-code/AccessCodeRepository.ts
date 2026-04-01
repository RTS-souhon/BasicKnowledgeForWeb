import type { createDatabaseClient } from '@backend/src/db/connection';
import { accessCodes } from '@backend/src/db/schema';
import { desc, eq } from 'drizzle-orm';
import type {
    AccessCode,
    IAccessCodeRepository,
    NewAccessCode,
} from './IAccessCodeRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class AccessCodeRepository implements IAccessCodeRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findAll(): Promise<AccessCode[]> {
        return this.db
            .select()
            .from(accessCodes)
            .orderBy(desc(accessCodes.validFrom));
    }

    async findByCode(code: string): Promise<AccessCode | null> {
        const [row] = await this.db
            .select()
            .from(accessCodes)
            .where(eq(accessCodes.code, code))
            .limit(1);
        return row ?? null;
    }

    async create(input: NewAccessCode): Promise<AccessCode> {
        const [row] = await this.db
            .insert(accessCodes)
            .values(input)
            .returning();
        return row;
    }

    async deleteById(id: string): Promise<boolean> {
        const rows = await this.db
            .delete(accessCodes)
            .where(eq(accessCodes.id, id))
            .returning({ id: accessCodes.id });
        return rows.length > 0;
    }
}
