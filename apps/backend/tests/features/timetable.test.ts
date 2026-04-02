import { describe, expect, it, jest } from '@jest/globals';
import type {
    ITimetableRepository,
    TimetableItem,
} from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import { createTestAppWithTimetable } from '../helpers/createTestApp';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const item1: TimetableItem = {
    id: '10000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    title: '開会式',
    startTime: new Date('2025-08-01T10:00:00Z'),
    endTime: new Date('2025-08-01T11:00:00Z'),
    location: '会場 A',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const item2: TimetableItem = {
    ...item1,
    id: '10000000-0000-0000-0000-000000000002',
    title: '○○企画',
    startTime: new Date('2025-08-01T11:00:00Z'),
    endTime: new Date('2025-08-01T12:00:00Z'),
    location: '会場 B',
};

function createMockTimetableRepository(
    overrides: Partial<ITimetableRepository> = {},
): ITimetableRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<TimetableItem[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/timetable ───────────────────────────────────────────────────────

describe('GET /api/timetable', () => {
    it('有効な x-event-id で 200 と items 配列が返ること', async () => {
        const repo = createMockTimetableRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<TimetableItem[]>>()
                .mockResolvedValue([item1, item2]),
        });
        const app = createTestAppWithTimetable(repo);

        const res = await app.request('/api/timetable', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: TimetableItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(2);
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<TimetableItem[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(
                    eventId === EVENT_ID ? [item1, item2] : [],
                ),
            );
        const app = createTestAppWithTimetable(
            createMockTimetableRepository({ findByEventId }),
        );

        const res = await app.request('/api/timetable', {
            headers: { 'x-event-id': OTHER_EVENT_ID },
        });
        const body = (await res.json()) as { items: TimetableItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('start_time 昇順で返ること', async () => {
        const repo = createMockTimetableRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<TimetableItem[]>>()
                .mockResolvedValue([item1, item2]),
        });
        const app = createTestAppWithTimetable(repo);

        const res = await app.request('/api/timetable', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: TimetableItem[] };

        expect(body.items[0]?.id).toBe(item1.id);
        expect(body.items[1]?.id).toBe(item2.id);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithTimetable(createMockTimetableRepository());

        const res = await app.request('/api/timetable');

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithTimetable(createMockTimetableRepository());

        const res = await app.request('/api/timetable', {
            headers: { 'x-event-id': 'not-a-uuid' },
        });

        expect(res.status).toBe(400);
    });

    it('0 件のとき空配列が返ること', async () => {
        const app = createTestAppWithTimetable(createMockTimetableRepository());

        const res = await app.request('/api/timetable', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: TimetableItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
    });
});
