import type { createDatabaseClient } from '@backend/src/db/connection';
import { users } from '@backend/src/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { IUserRepository, NewUser, User } from './IUserRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class UserRepository implements IUserRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findAll(): Promise<User[]> {
        return this.db.select().from(users).orderBy(desc(users.createdAt));
    }

    async findById(id: string): Promise<User | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return user ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return user ?? null;
    }

    async create(input: NewUser): Promise<User> {
        const [newUser] = await this.db.insert(users).values(input).returning();
        return newUser;
    }

    async updateRole(id: string, role: string): Promise<User | null> {
        const [updated] = await this.db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return updated ?? null;
    }
}
