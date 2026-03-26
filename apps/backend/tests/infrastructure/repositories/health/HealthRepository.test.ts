import { describe, expect, it, jest } from '@jest/globals';
import type { createDatabaseClient } from '@/db/connection';
import { HealthRepository } from '@/infrastructure/repositories/health/HealthRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

function createMockDb(
    executeImpl: () => Promise<unknown>,
): DatabaseClient {
    return {
        execute: jest.fn(executeImpl),
    } as unknown as DatabaseClient;
}

describe('HealthRepository', () => {
    describe('checkConnection', () => {
        it('DBクエリが成功した場合、trueを返す', async () => {
            const db = createMockDb(() => Promise.resolve({ rows: [{ '?column?': 1 }] }));
            const repository = new HealthRepository(db);

            const result = await repository.checkConnection();

            expect(result).toBe(true);
            expect(db.execute).toHaveBeenCalledTimes(1);
        });

        it('DBクエリが失敗した場合、falseを返す（例外をキャッチ）', async () => {
            const db = createMockDb(() =>
                Promise.reject(new Error('Connection refused')),
            );
            const repository = new HealthRepository(db);

            const result = await repository.checkConnection();

            expect(result).toBe(false);
        });

        it('DBが同期的に例外をスローした場合、falseを返す', async () => {
            const db = {
                execute: jest.fn(() => {
                    throw new Error('Unexpected error');
                }),
            } as unknown as DatabaseClient;
            const repository = new HealthRepository(db);

            const result = await repository.checkConnection();

            expect(result).toBe(false);
        });
    });
});
