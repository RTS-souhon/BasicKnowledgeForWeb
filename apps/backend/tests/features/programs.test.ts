import { describe, expect, it, jest } from '@jest/globals';
import type {
    IProgramRepository,
    Program,
} from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import { createTestAppWithPrograms } from '../helpers/createTestApp';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const program1: Program = {
    id: '30000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    name: '○○サークル展示',
    location: '会場 A',
    startTime: new Date('2025-08-01T10:00:00Z'),
    endTime: new Date('2025-08-01T12:00:00Z'),
    description: '説明テキスト',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const program2: Program = {
    ...program1,
    id: '30000000-0000-0000-0000-000000000002',
    name: '△△サークル展示',
    startTime: new Date('2025-08-01T13:00:00Z'),
    endTime: new Date('2025-08-01T15:00:00Z'),
};

function createMockProgramRepository(
    overrides: Partial<IProgramRepository> = {},
): IProgramRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<Program[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/programs ────────────────────────────────────────────────────────

describe('GET /api/programs', () => {
    it('有効な x-event-id で 200 と programs 配列が返ること', async () => {
        const repo = createMockProgramRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<Program[]>>()
                .mockResolvedValue([program1, program2]),
        });
        const app = createTestAppWithPrograms(repo);

        const res = await app.request('/api/programs', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { programs: Program[] };

        expect(res.status).toBe(200);
        expect(body.programs).toHaveLength(2);
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<Program[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(
                    eventId === EVENT_ID ? [program1, program2] : [],
                ),
            );
        const app = createTestAppWithPrograms(
            createMockProgramRepository({ findByEventId }),
        );

        const res = await app.request('/api/programs', {
            headers: { 'x-event-id': OTHER_EVENT_ID },
        });
        const body = (await res.json()) as { programs: Program[] };

        expect(res.status).toBe(200);
        expect(body.programs).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('start_time 昇順で返ること', async () => {
        const repo = createMockProgramRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<Program[]>>()
                .mockResolvedValue([program1, program2]),
        });
        const app = createTestAppWithPrograms(repo);

        const res = await app.request('/api/programs', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { programs: Program[] };

        expect(body.programs[0]?.id).toBe(program1.id);
        expect(body.programs[1]?.id).toBe(program2.id);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithPrograms(createMockProgramRepository());

        const res = await app.request('/api/programs');

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithPrograms(createMockProgramRepository());

        const res = await app.request('/api/programs', {
            headers: { 'x-event-id': 'not-a-uuid' },
        });

        expect(res.status).toBe(400);
    });
});
