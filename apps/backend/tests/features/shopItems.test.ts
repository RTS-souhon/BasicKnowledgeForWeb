import { describe, expect, it, jest } from '@jest/globals';
import type {
    IShopItemRepository,
    ShopItem,
} from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import { createTestAppWithShopItems } from '../helpers/createTestApp';

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

function createMockShopItemRepository(
    overrides: Partial<IShopItemRepository> = {},
): IShopItemRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<ShopItem[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/shop-items ──────────────────────────────────────────────────────

describe('GET /api/shop-items', () => {
    it('有効な x-event-id で 200 と items 配列が返ること', async () => {
        const repo = createMockShopItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<ShopItem[]>>()
                .mockResolvedValue([shopItem1, shopItem2]),
        });
        const app = createTestAppWithShopItems(repo);

        const res = await app.request('/api/shop-items', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: ShopItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(2);
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

        const res = await app.request('/api/shop-items', {
            headers: { 'x-event-id': OTHER_EVENT_ID },
        });
        const body = (await res.json()) as { items: ShopItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request('/api/shop-items');

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithShopItems(createMockShopItemRepository());

        const res = await app.request('/api/shop-items', {
            headers: { 'x-event-id': 'not-a-uuid' },
        });

        expect(res.status).toBe(400);
    });

    it('stock_status が正しく返ること', async () => {
        const repo = createMockShopItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<ShopItem[]>>()
                .mockResolvedValue([shopItem1, shopItem2]),
        });
        const app = createTestAppWithShopItems(repo);

        const res = await app.request('/api/shop-items', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: ShopItem[] };

        expect(body.items[0]?.stockStatus).toBe('available');
        expect(body.items[1]?.stockStatus).toBe('low');
    });
});
