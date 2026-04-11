import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
    buildContentFetchHeaders: jest.fn(),
}));

jest.mock('@frontend/app/actions/others', () => ({
    createOtherItemAction: jest.fn(),
    updateOtherItemAction: jest.fn(),
    deleteOtherItemAction: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const OthersPage =
    require('@frontend/app/(authenticated)/others/page').default as typeof import('@frontend/app/(authenticated)/others/page').default;

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
        title: '緊急連絡先',
        content: 'スタッフ控室: 内線123\nセキュリティ: 内線456',
        displayOrder: 1,
    },
    {
        id: '2',
        title: 'Wi-Fi情報',
        content: 'SSID: EventStaff2025\nPW: staff2025',
        displayOrder: 2,
    },
    {
        id: '3',
        title: '駐車場案内',
        content: 'P1: スタッフ専用',
        displayOrder: 0,
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    mockBuildHeaders.mockReturnValue({});
});

describe('OthersPage', () => {
    it('会期未選択時に案内メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(NO_AUTH);

        const element = await OthersPage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(screen.getByText('その他の情報')).toBeInTheDocument();
        expect(
            screen.getByText('会期が選択されていません'),
        ).toBeInTheDocument();
    });

    it('情報がないとき空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: [] }), { status: 200 }),
        );

        const element = await OthersPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(
            screen.getByText('登録されているその他の情報はありません'),
        ).toBeInTheDocument();
    });

    it('情報をdisplayOrder順に表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await OthersPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        const titles = screen
            .getAllByText(/緊急連絡先|Wi-Fi情報|駐車場案内/)
            .map((el) => el.textContent);
        expect(titles[0]).toBe('駐車場案内');
        expect(titles[1]).toBe('緊急連絡先');
        expect(titles[2]).toBe('Wi-Fi情報');
    });

    it('タイトルとコンテンツを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(
                JSON.stringify({ items: [MOCK_ITEMS[0]] }),
                { status: 200 },
            ),
        );

        const element = await OthersPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(screen.getByText('緊急連絡先')).toBeInTheDocument();
        expect(
            screen.getByText(/スタッフ控室: 内線123/),
        ).toBeInTheDocument();
    });

    it('admin ロールの場合、管理パネルを表示する', async () => {
        const adminAuth: serverAuth.ResolvedAuth = {
            eventId: 'event-1',
            authToken: 'auth-token',
            accessToken: null,
            role: 'admin',
        };
        mockResolveAuth.mockResolvedValue(adminAuth);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await OthersPage({
            searchParams: Promise.resolve({ event_id: 'event-1' }),
        });
        render(element);

        expect(
            screen.getByRole('button', { name: '+ 追加' }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: '編集' })).toHaveLength(3);
        expect(screen.getAllByRole('button', { name: '削除' })).toHaveLength(3);
    });
});
