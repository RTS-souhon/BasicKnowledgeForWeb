import { beforeAll, it } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type { IShopItemRepository, ShopItem } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import { sign } from 'hono/jwt';
import { createTestAppWithShopItems } from './helpers/createTestApp';

const JWT_SECRET = 'test-secret';
const mockEnv = { JWT_SECRET } as unknown as Env;
const EVENT_ID = '00000000-0000-4000-8000-000000000001';

const shopItem1: ShopItem = {
    id: '40000000-0000-4000-8000-000000000001', eventId: EVENT_ID,
    name: 'グッズ A', price: 500, stockStatus: 'available', description: null,
    imageUrl: 'https://assets.example.com/event-1/item-1.webp',
    createdAt: new Date(), updatedAt: new Date(),
};

let adminToken: string;
beforeAll(async () => {
    adminToken = await sign(
        { id: 'admin-id', name: 'Admin', email: 'admin@test.com', role: 'admin', exp: Math.floor(Date.now()/1000)+3600 },
        JWT_SECRET, 'HS256',
    );
});

it('debug POST shop-items', async () => {
    const repo: IShopItemRepository = {
        findByEventId: () => Promise.resolve([]),
        search: () => Promise.resolve([]),
        create: () => Promise.resolve(shopItem1),
        update: () => Promise.resolve(shopItem1),
        delete: () => Promise.resolve(true),
    };
    const app = createTestAppWithShopItems(repo);
    const body = {
        event_id: EVENT_ID,
        name: 'グッズ A',
        price: 500,
        stock_status: 'available',
        image_key: 'shop-items/event-1/uuid.webp',
        image_url: 'https://assets.example.com/event-1/uuid.webp',
    };
    const res = await app.request(
        '/api/shop-items',
        { method: 'POST', headers: { 'x-event-id': EVENT_ID, 'Content-Type': 'application/json', Cookie: `auth_token=${adminToken}` }, body: JSON.stringify(body) },
        mockEnv,
    );
    console.log('Status:', res.status, 'Body:', await res.text());
});
