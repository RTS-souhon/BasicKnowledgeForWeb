import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
    buildContentFetchHeaders: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const ShopPage =
    require('@frontend/app/(authenticated)/shop/page').default as typeof import('@frontend/app/(authenticated)/shop/page').default;

const mockResolveAuth = jest.mocked(serverAuth.resolveAuth);
const mockBuildHeaders = jest.mocked(serverAuth.buildContentFetchHeaders);

const NO_AUTH: serverAuth.ResolvedAuth = {
    eventId: null,
    authToken: null,
    accessToken: null,
    role: 'user',
};
const WITH_AUTH: serverAuth.ResolvedAuth = {
    eventId: 'event-1',
    authToken: null,
    accessToken: 'token',
    role: 'user',
};

const MOCK_ITEMS = [
    {
        id: '1',
        name: '公式パンフレット',
        price: 500,
        stockStatus: 'available',
        description: null,
    },
    {
        id: '2',
        name: '限定Tシャツ',
        price: 2500,
        stockStatus: 'low',
        description: 'サイズはS・M・Lのみ',
    },
    {
        id: '3',
        name: '缶バッジセット',
        price: 300,
        stockStatus: 'sold_out',
        description: null,
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    mockBuildHeaders.mockReturnValue({});
});

describe('ShopPage', () => {
    it('会期未選択時に案内メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(NO_AUTH);

        const element = await ShopPage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(
            screen.getByText('会期が選択されていません'),
        ).toBeInTheDocument();
    });

    it('販売物がないとき空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: [] }), { status: 200 }),
        );

        const element = await ShopPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(
            screen.getByText('登録されている販売物はありません'),
        ).toBeInTheDocument();
    });

    it('販売物一覧を表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await ShopPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(screen.getByText('公式パンフレット')).toBeInTheDocument();
        expect(screen.getByText('限定Tシャツ')).toBeInTheDocument();
        expect(screen.getByText('缶バッジセット')).toBeInTheDocument();
    });

    it('価格を正しくフォーマットして表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await ShopPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(screen.getByText('¥2,500')).toBeInTheDocument();
    });

    it('在庫ステータスラベルを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await ShopPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(screen.getByText('在庫あり')).toBeInTheDocument();
        expect(screen.getByText('残りわずか')).toBeInTheDocument();
        expect(screen.getByText('売り切れ')).toBeInTheDocument();
    });

    it('descriptionがある場合に表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await ShopPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(screen.getByText('サイズはS・M・Lのみ')).toBeInTheDocument();
    });
});
