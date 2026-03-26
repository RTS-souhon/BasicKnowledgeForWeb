import type { createDatabaseClient } from '@backend/src/db/connection';
import { users } from '@backend/src/db/schema';
import { eq } from 'drizzle-orm';
import type { IUserRepository, NewUser, User } from './IUserRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class UserRepository implements IUserRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findAll(): Promise<User[]> {
        return this.db.select().from(users);
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
}
