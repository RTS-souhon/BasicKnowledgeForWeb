import { sql } from 'drizzle-orm';
import type { createDatabaseClient } from '@/db/connection';
import type { IHealthRepository } from './IHealthRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class HealthRepository implements IHealthRepository {
    constructor(private readonly db: DatabaseClient) {}

    async checkConnection(): Promise<boolean> {
        try {
            await this.db.execute(sql`SELECT 1`);
            return true;
        } catch {
            return false;
        }
    }
}
