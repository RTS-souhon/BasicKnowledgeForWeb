import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
    buildContentFetchHeaders: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const TimetablePage =
    require('@frontend/app/(authenticated)/timetable/page').default as typeof import('@frontend/app/(authenticated)/timetable/page').default;

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
    accessToken: 'access-token',
    role: 'user',
};

const MOCK_ITEMS = [
    {
        id: '1',
        title: '開会式',
        startTime: '2025-08-01T09:00:00.000Z',
        endTime: '2025-08-01T09:30:00.000Z',
        location: '大ホール',
        description: null,
    },
    {
        id: '2',
        title: 'スタッフ集合',
        startTime: '2025-08-01T08:00:00.000Z',
        endTime: '2025-08-01T08:30:00.000Z',
        location: 'ロビー',
        description: '全員参加',
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    mockBuildHeaders.mockReturnValue({});
});

describe('TimetablePage', () => {
    it('会期未選択時に案内メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(NO_AUTH);

        const element = await TimetablePage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(
            screen.getByText('会期が選択されていません'),
        ).toBeInTheDocument();
    });

    it('アイテムがないとき空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: [] }), { status: 200 }),
        );

        const element = await TimetablePage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(
            screen.getByText('登録されているタイムテーブルはありません'),
        ).toBeInTheDocument();
    });

    it('アイテムを開始時刻順に表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await TimetablePage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(screen.getByText('開会式')).toBeInTheDocument();
        expect(screen.getByText('スタッフ集合')).toBeInTheDocument();

        const titles = screen
            .getAllByText(/開会式|スタッフ集合/)
            .map((el) => el.textContent);
        expect(titles[0]).toBe('スタッフ集合');
        expect(titles[1]).toBe('開会式');
    });

    it('descriptionがある場合に表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ items: MOCK_ITEMS }), {
                status: 200,
            }),
        );

        const element = await TimetablePage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(screen.getByText('全員参加')).toBeInTheDocument();
    });

    it('fetchが失敗したとき空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue(WITH_AUTH);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 401 }),
        );

        const element = await TimetablePage({
            searchParams: Promise.resolve({}),
        });
        render(element);

        expect(
            screen.getByText('登録されているタイムテーブルはありません'),
        ).toBeInTheDocument();
    });
});
