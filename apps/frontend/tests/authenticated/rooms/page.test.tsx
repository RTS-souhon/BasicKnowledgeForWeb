import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
    buildContentFetchHeaders: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const RoomsPage =
    require('@frontend/app/(authenticated)/rooms/page').default as typeof import('@frontend/app/(authenticated)/rooms/page').default;

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

const MOCK_ROOMS = [
    {
        id: '1',
        buildingName: 'A棟',
        floor: '2F',
        roomName: '第1会議室',
        preDayManagerId: null,
        preDayManagerName: null,
        preDayPurpose: null,
        dayManagerId: 'dept-1',
        dayManagerName: '運営部',
        dayPurpose: '受付',
        notes: null,
    },
    {
        id: '2',
        buildingName: 'A棟',
        floor: '2F',
        roomName: '第2会議室',
        preDayManagerId: 'dept-2',
        preDayManagerName: '企画部',
        preDayPurpose: '準備',
        dayManagerId: 'dept-1',
        dayManagerName: '運営部',
        dayPurpose: '展示',
        notes: '追加机あり',
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    mockBuildHeaders.mockReturnValue({});
});

describe('RoomsPage', () => {
    it('会期未選択時に案内メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(NO_AUTH);

        const element = await RoomsPage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(
            screen.getByText('会期が選択されていません'),
        ).toBeInTheDocument();
    });

    it('部屋がないとき空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ rooms: [] }), { status: 200 }),
        );

        const element = await RoomsPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(
            screen.getByText('登録されている部屋割りはありません'),
        ).toBeInTheDocument();
    });

    it('部屋一覧をテーブル形式で表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ rooms: MOCK_ROOMS }), {
                status: 200,
            }),
        );

        const element = await RoomsPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        const table = screen.getByRole('table', { name: '部屋割り一覧' });
        expect(table).toBeInTheDocument();
        expect(within(table).getByText('第1会議室')).toBeInTheDocument();
        expect(within(table).getByText('第2会議室')).toBeInTheDocument();
        expect(within(table).getAllByText('A棟・2F').length).toBeGreaterThan(0);
        expect(
            within(table).getByText('運営部 — 受付'),
        ).toBeInTheDocument();
    });

    it('モバイルカードで前日担当と備考を表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ rooms: MOCK_ROOMS }), {
                status: 200,
            }),
        );

        const element = await RoomsPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        const card = screen.getByRole('article', {
            name: '第2会議室の割当情報',
        });
        expect(card).toHaveTextContent('A棟・2F');
        expect(card).toHaveTextContent('企画部 — 準備');
        expect(card).toHaveTextContent('備考: 追加机あり');
    });
});
