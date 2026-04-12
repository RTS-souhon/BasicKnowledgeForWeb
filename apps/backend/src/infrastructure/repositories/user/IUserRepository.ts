import type { users } from '@backend/src/db/schema';

export type User = typeof users.$inferSelect;

export type UserPublic = Omit<User, 'password'>;

export type NewUser = {
    name: string;
    email: string;
    password: string;
    role: string;
};

export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: NewUser): Promise<User>;
    updateRole(id: string, role: string): Promise<User | null>;
    updatePassword(id: string, hashedPassword: string): Promise<void>;
}
