import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type {
    IRoomRepository,
    RoomWithDepartments,
} from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import { sign } from 'hono/jwt';
import { createTestAppWithRooms } from '../helpers/createTestApp';

const JWT_SECRET = 'test-secret';
const mockEnv = { JWT_SECRET } as unknown as Env;

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const DEPT_ID_1 = '60000000-0000-4000-8000-000000000001';
const DEPT_ID_2 = '60000000-0000-4000-8000-000000000002';

const room1: RoomWithDepartments = {
    id: '20000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    buildingName: 'A棟',
    floor: '1階',
    roomName: '会場 A',
    preDayManagerId: DEPT_ID_1,
    preDayManagerName: '総務部',
    preDayPurpose: '搬入受付',
    dayManagerId: DEPT_ID_1,
    dayManagerName: '総務部',
    dayPurpose: '本部受付',
    notes: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const room2: RoomWithDepartments = {
    ...room1,
    id: '20000000-0000-0000-0000-000000000002',
    roomName: '会場 B',
    preDayManagerId: null,
    preDayManagerName: null,
    preDayPurpose: null,
    dayManagerId: DEPT_ID_2,
    dayManagerName: '企画部',
    dayPurpose: 'メイン企画',
};

let accessToken: string;

beforeAll(async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    accessToken = await sign({ event_id: EVENT_ID, exp }, JWT_SECRET);
});

function createMockRoomRepository(
    overrides: Partial<IRoomRepository> = {},
): IRoomRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<RoomWithDepartments[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/rooms ───────────────────────────────────────────────────────────

describe('GET /api/rooms', () => {
    it('有効な x-event-id で 200 と rooms 配列が返ること', async () => {
        const repo = createMockRoomRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<RoomWithDepartments[]>>()
                .mockResolvedValue([room1, room2]),
        });
        const app = createTestAppWithRooms(repo);

        const res = await app.request(
            '/api/rooms',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { rooms: RoomWithDepartments[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(2);
    });

    it('部署名が含まれること', async () => {
        const repo = createMockRoomRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<RoomWithDepartments[]>>()
                .mockResolvedValue([room1, room2]),
        });
        const app = createTestAppWithRooms(repo);

        const res = await app.request(
            '/api/rooms',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { rooms: RoomWithDepartments[] };

        expect(body.rooms[0]?.dayManagerName).toBe('総務部');
        expect(body.rooms[1]?.preDayManagerName).toBeNull();
        expect(body.rooms[1]?.dayManagerName).toBe('企画部');
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<RoomWithDepartments[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(eventId === EVENT_ID ? [room1, room2] : []),
            );
        const app = createTestAppWithRooms(
            createMockRoomRepository({ findByEventId }),
        );

        const res = await app.request(
            '/api/rooms',
            {
                headers: {
                    'x-event-id': OTHER_EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { rooms: RoomWithDepartments[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('認証なしのとき 401 が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request('/api/rooms', {
            headers: { 'x-event-id': EVENT_ID },
        });

        expect(res.status).toBe(401);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request(
            '/api/rooms',
            { headers: { Cookie: `access_token=${accessToken}` } },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request(
            '/api/rooms',
            {
                headers: {
                    'x-event-id': 'not-a-uuid',
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });

    it('0 件のとき空配列が返ること', async () => {
        const app = createTestAppWithRooms(createMockRoomRepository());

        const res = await app.request(
            '/api/rooms',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { rooms: RoomWithDepartments[] };

        expect(res.status).toBe(200);
        expect(body.rooms).toHaveLength(0);
    });
});
