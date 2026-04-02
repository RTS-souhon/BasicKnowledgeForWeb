import { describe, expect, it, jest } from '@jest/globals';
import type {
    IOtherItemRepository,
    OtherItem,
} from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import { createTestAppWithOtherItems } from '../helpers/createTestApp';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const otherItem1: OtherItem = {
    id: '50000000-0000-0000-0000-000000000001',
    eventId: EVENT_ID,
    title: '注意事項',
    content: '当日の持ち物について...',
    displayOrder: 1,
    createdBy: '00000000-0000-0000-0000-000000000099',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
};

const otherItem2: OtherItem = {
    ...otherItem1,
    id: '50000000-0000-0000-0000-000000000002',
    title: '緊急連絡先',
    content: '責任者: 090-XXXX-XXXX',
    displayOrder: 2,
};

function createMockOtherItemRepository(
    overrides: Partial<IOtherItemRepository> = {},
): IOtherItemRepository {
    return {
        findByEventId: jest
            .fn<(eventId: string) => Promise<OtherItem[]>>()
            .mockResolvedValue([]),
        ...overrides,
    };
}

// ─── GET /api/others ──────────────────────────────────────────────────────────

describe('GET /api/others', () => {
    it('有効な x-event-id で 200 と items 配列が返ること', async () => {
        const repo = createMockOtherItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<OtherItem[]>>()
                .mockResolvedValue([otherItem1, otherItem2]),
        });
        const app = createTestAppWithOtherItems(repo);

        const res = await app.request('/api/others', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: OtherItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(2);
    });

    it('x-event-id でフィルタリングされること', async () => {
        const findByEventId = jest
            .fn<(eventId: string) => Promise<OtherItem[]>>()
            .mockImplementation((eventId) =>
                Promise.resolve(
                    eventId === EVENT_ID ? [otherItem1, otherItem2] : [],
                ),
            );
        const app = createTestAppWithOtherItems(
            createMockOtherItemRepository({ findByEventId }),
        );

        const res = await app.request('/api/others', {
            headers: { 'x-event-id': OTHER_EVENT_ID },
        });
        const body = (await res.json()) as { items: OtherItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
        expect(findByEventId).toHaveBeenCalledWith(OTHER_EVENT_ID);
    });

    it('display_order 昇順で返ること', async () => {
        const repo = createMockOtherItemRepository({
            findByEventId: jest
                .fn<(eventId: string) => Promise<OtherItem[]>>()
                .mockResolvedValue([otherItem1, otherItem2]),
        });
        const app = createTestAppWithOtherItems(repo);

        const res = await app.request('/api/others', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: OtherItem[] };

        expect(body.items[0]?.displayOrder).toBe(1);
        expect(body.items[1]?.displayOrder).toBe(2);
    });

    it('x-event-id ヘッダーが未指定のとき 400 が返ること', async () => {
        const app = createTestAppWithOtherItems(createMockOtherItemRepository());

        const res = await app.request('/api/others');

        expect(res.status).toBe(400);
    });

    it('x-event-id が UUID でないとき 400 が返ること', async () => {
        const app = createTestAppWithOtherItems(createMockOtherItemRepository());

        const res = await app.request('/api/others', {
            headers: { 'x-event-id': 'not-a-uuid' },
        });

        expect(res.status).toBe(400);
    });

    it('0 件のとき空配列が返ること', async () => {
        const app = createTestAppWithOtherItems(createMockOtherItemRepository());

        const res = await app.request('/api/others', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as { items: OtherItem[] };

        expect(res.status).toBe(200);
        expect(body.items).toHaveLength(0);
    });
});
