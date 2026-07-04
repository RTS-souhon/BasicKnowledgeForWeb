import { describe, expect, it, jest } from '@jest/globals';
import type { createDatabaseClient } from '@backend/src/db/connection';
import { TimetableRepository } from '@backend/src/infrastructure/repositories/timetable/TimetableRepository';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';

jest.mock(
    '@backend/src/infrastructure/repositories/utils/escapeIlikePattern',
    () => ({
        createIlikePattern: jest.fn().mockReturnValue('%escaped%'),
    }),
);

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

const EVENT_ID = '00000000-0000-0000-0000-000000000001';
const mockedCreateIlikePattern = createIlikePattern as jest.MockedFunction<
    typeof createIlikePattern
>;

describe('TimetableRepository', () => {
    it('findByEventId が start_time 昇順で select クエリを実行すること', async () => {
        const orderBy = jest
            .fn()
            .mockImplementation(() => Promise.resolve([]));
        const where = jest.fn().mockReturnValue({ orderBy });
        const query = {
            leftJoin: jest.fn(),
            where,
        };
        query.leftJoin.mockReturnValue(query);
        const from = jest.fn().mockReturnValue(query);
        const db = {
            select: jest.fn().mockReturnValue({ from }),
        } as unknown as DatabaseClient;

        const repo = new TimetableRepository(db);
        await repo.findByEventId(EVENT_ID);

        expect(db.select).toHaveBeenCalled();
        expect(from).toHaveBeenCalled();
        expect(query.leftJoin).toHaveBeenCalledTimes(2);
        expect(where).toHaveBeenCalled();
        expect(orderBy).toHaveBeenCalled();
    });

    it('search が createIlikePattern を経由して ILIKE 検索を組み立てること', async () => {
        mockedCreateIlikePattern.mockClear();
        const orderBy = jest
            .fn()
            .mockImplementation(() => Promise.resolve([]));
        const where = jest.fn().mockReturnValue({ orderBy });
        const query = {
            leftJoin: jest.fn(),
            where,
        };
        query.leftJoin.mockReturnValue(query);
        const from = jest.fn().mockReturnValue(query);
        const db = {
            select: jest.fn().mockReturnValue({ from }),
        } as unknown as DatabaseClient;

        const repo = new TimetableRepository(db);
        await repo.search('会場_%', EVENT_ID);

        expect(mockedCreateIlikePattern).toHaveBeenCalledWith('会場_%');
        expect(query.leftJoin).toHaveBeenCalledTimes(2);
        expect(where).toHaveBeenCalled();
        expect(orderBy).toHaveBeenCalled();
    });
});
