import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type {
    IShopItemRepository,
    ShopItem,
} from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import { sign } from 'hono/jwt';
import { createTestAppWithShopItems } from '../helpers/createTestApp';

const JWT_SECRET = 'test-secret';
const mockEnv = { JWT_SECRET } as unknown as Env;

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const shopItem1: ShopItem = {
    id: '40000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    name: 'グッズ A',
    price: 500,
    stockStatus: 'available',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const shopItem2: ShopItem = {
    ...shopItem1,
    id: '40000000-0000-0000-0000-000000000002',
    name: 'グッズ B',
    price: 1000,
    stockStatus: 'low',
};

let accessToken: string;
let adminToken: string;
let userToken: string;

beforeAll(async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    accessToken = await sign({ event_id: EVENT_ID, exp }, JWT_SECRET);
    adminToken = await sign(
        { id: 'admin-id', name: 'Admin', email: 'admin@test.com', role: 'admin', exp },
        JWT_SECRET,
        'HS256',
    );
    userToken = await sign(
        { id: 'user-id', name: 'User', email: 'user@test.com', role: 'user', exp },
        JWT_SECRET,
        'HS256',
    );
});

function createMockShopItemRepository(
    overrides: Partial<IShopItemRepository> = {},
): IShopItemRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<ShopItem[]>>()
            .mockResolvedValue([]),
        search: jest
            .fn<
                (keyword: string, eventId: string) => Promise<ShopItem[]>
            >()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/shop-items ──────────────────────────────────────────────────────

describe('GET /api/shop-items', () => {
    it('有効な access_token と一致する x-event-id で 200 と items 配列が返ること', async () => {
        const repo = createMockShopItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<ShopItem[]>>()
                .mockResolvedValue([shopItem1, shopItem2]),
        });
        const app = createTestAppWithShopItems(repo);

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { items: ShopItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(2);
    });

    it('admin の auth_token で 200 が返ること', async () => {
        const repo = createMockShopItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<ShopItem[]>>()
                .mockResolvedValue([shopItem1]),
        });
        const app = createTestAppWithShopItems(repo);

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `auth_token=${adminToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(200);
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<ShopItem[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(
                    eventId === EVENT_ID ? [shopItem1, shopItem2] : [],
                ),
            );
        const app = createTestAppWithShopItems(
            createMockShopItemRepository({ findByEventId }),
        );

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': OTHER_EVENT_ID,
                    Cookie: `auth_token=${adminToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { items: ShopItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('認証なしのとき 401 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request('/api/shop-items', {
            headers: { 'x-event-id': EVENT_ID },
        });

        expect(res.status).toBe(401);
    });

    it('role=user の auth_token では 401 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `auth_token=${userToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(401);
    });

    it('access_token の event_id と x-event-id が不一致のとき 401 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': OTHER_EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(401);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request(
            '/api/shop-items',
            { headers: { Cookie: `auth_token=${adminToken}` } },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': 'not-a-uuid',
                    Cookie: `auth_token=${adminToken}`,
                },
            },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });

    it('stock_status が正しく返ること', async () => {
        const repo = createMockShopItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<ShopItem[]>>()
                .mockResolvedValue([shopItem1, shopItem2]),
        });
        const app = createTestAppWithShopItems(repo);

        const res = await app.request(
            '/api/shop-items',
            {
                headers: {
                    'x-event-id': EVENT_ID,
                    Cookie: `access_token=${accessToken}`,
                },
            },
            mockEnv,
        );
        const body = (await res.json()) as { items: ShopItem[] };

        expect(body.items[0]?.stockStatus).toBe('available');
        expect(body.items[1]?.stockStatus).toBe('low');
    });
});
