import type { users } from '@backend/src/db/schema';

export type User = typeof users.$inferSelect;

export type NewUser = {
    name: string;
    email: string;
    password: string;
    role: string;
};

export interface IUserRepository {
    findAll(): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    create(input: NewUser): Promise<User>;
}
