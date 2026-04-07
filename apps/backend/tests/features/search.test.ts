import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type {
    IOtherItemRepository,
    OtherItem,
} from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    IProgramRepository,
    Program,
} from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    IRoomRepository,
    RoomWithDepartments,
} from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type {
    IShopItemRepository,
    ShopItem,
} from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type {
    ITimetableRepository,
    TimetableItem,
} from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import { sign } from 'hono/jwt';
import { createTestAppWithSearch } from '../helpers/createTestApp';

const JWT_SECRET = 'test-secret';
const mockEnv = { JWT_SECRET } as unknown as Env;

const EVENT_ID = '00000000-0000-4000-8000-000000000001';

let accessToken: string;

beforeAll(async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    accessToken = await sign({ event_id: EVENT_ID, exp }, JWT_SECRET);
});

function createRepositories() {
    const timetableRepository: ITimetableRepository = {
        findByEventId: jest
            .fn<(eventId: string) => Promise<TimetableItem[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<
                (keyword: string, eventId: string) => Promise<TimetableItem[]>
            >()
            .mockResolvedValue([]),
    };
    const roomRepository: IRoomRepository = {
        findByEventId: jest
            .fn<(eventId: string) => Promise<RoomWithDepartments[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<
                (
                    keyword: string,
                    eventId: string,
                ) => Promise<RoomWithDepartments[]>
            >()
            .mockResolvedValue([]),
    };
    const programRepository: IProgramRepository = {
        findByEventId: jest
            .fn<(eventId: string) => Promise<Program[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<(keyword: string, eventId: string) => Promise<Program[]>>()
            .mockResolvedValue([]),
    };
    const shopItemRepository: IShopItemRepository = {
        findByEventId: jest
            .fn<(eventId: string) => Promise<ShopItem[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<(keyword: string, eventId: string) => Promise<ShopItem[]>>()
            .mockResolvedValue([]),
    };
    const otherItemRepository: IOtherItemRepository = {
        findByEventId: jest
            .fn<(eventId: string) => Promise<OtherItem[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<(keyword: string, eventId: string) => Promise<OtherItem[]>>()
            .mockResolvedValue([]),
    };
    return {
        timetableRepository,
        roomRepository,
        programRepository,
        shopItemRepository,
        otherItemRepository,
    };
}

describe('GET /api/search', () => {
    it('有効な access_token と x-event-id で検索結果を返す', async () => {
        const {
            timetableRepository,
            roomRepository,
            programRepository,
            shopItemRepository,
            otherItemRepository,
        } = createRepositories();

        jest.spyOn(timetableRepository, 'search').mockResolvedValue([
            {
                id: 'tt-1',
                eventId: EVENT_ID,
                title: '開会式',
                startTime: new Date(),
                endTime: new Date(),
                location: '会場A',
                description: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        jest.spyOn(roomRepository, 'search').mockResolvedValue([
            {
                id: 'room-1',
                eventId: EVENT_ID,
                buildingName: 'A棟',
                floor: '2F',
                roomName: '201',
                preDayManagerId: null,
                preDayManagerName: null,
                preDayPurpose: null,
                dayManagerId: 'dept-1',
                dayManagerName: '運営部',
                dayPurpose: '受付',
                notes: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const app = createTestAppWithSearch({
            timetableRepository,
            roomRepository,
            programRepository,
            shopItemRepository,
            otherItemRepository,
        });

        const res = await app.request(
            '/api/search?q=開会',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(200);
        const body = (await res.json()) as {
            timetable: unknown[];
            rooms: unknown[];
        };
        expect(body.timetable).toHaveLength(1);
        expect(body.rooms).toHaveLength(1);
    });

    it('認証がない場合 401 を返す', async () => {
        const repos = createRepositories();
        const app = createTestAppWithSearch(repos);

        const res = await app.request('/api/search?q=foo', {
            headers: { 'x-event-id': EVENT_ID },
        });

        expect(res.status).toBe(401);
    });

    it('q が空文字の場合 400 を返す', async () => {
        const repos = createRepositories();
        const app = createTestAppWithSearch(repos);

        const res = await app.request(
            '/api/search?q=',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });
});
