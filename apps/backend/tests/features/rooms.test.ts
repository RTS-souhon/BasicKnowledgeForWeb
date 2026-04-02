import { describe, expect, it, jest } from '@jest/globals';
import type {
    IRoomRepository,
    Room,
} from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import { createTestAppWithRooms } from '../helpers/createTestApp';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const room1: Room = {
    id: '20000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    roomName: '会場 A',
    assignee: 'スタッフ1',
    purpose: '受付',
    notes: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const room2: Room = {
    ...room1,
    id: '20000000-0000-0000-0000-000000000002',
    roomName: '会場 B',
    assignee: 'スタッフ2',
    purpose: 'メイン企画',
};

function createMockRoomRepository(
    overrides: Partial<IRoomRepository> = {},
): IRoomRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<Room[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/rooms ───────────────────────────────────────────────────────────

describe('GET /api/rooms', () => {
    it('有効な x-event-id で 200 と rooms 配列が返ること', async () => {
        const repo = createMockRoomRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<Room[]>>()
                .mockResolvedValue([room1, room2]),
        });
        const app = createTestAppWithRooms(repo);

        const res = await app.request('/api/rooms', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { rooms: Room[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(2);
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<Room[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(eventId === EVENT_ID ? [room1, room2] : []),
            );
        const app = createTestAppWithRooms(
            createMockRoomRepository({ findByEventId }),
        );

        const res = await app.request('/api/rooms', {
            headers: { 'x-event-id': OTHER_EVENT_ID },
        });
        const body = (await res.json()) as { rooms: Room[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request('/api/rooms');

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request('/api/rooms', {
            headers: { 'x-event-id': 'not-a-uuid' },
        });

        expect(res.status).toBe(400);
    });

    it('0 件のとき空配列が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request('/api/rooms', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { rooms: Room[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(0);
    });
});
