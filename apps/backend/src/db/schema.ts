// src/db/schema.ts
import {
    cockroachTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/cockroach-core';

export const users = cockroachTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});
