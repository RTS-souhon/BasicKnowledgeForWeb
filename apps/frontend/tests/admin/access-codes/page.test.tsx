import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
}));

const mockRefreshForPage = jest.fn();

jest.mock('next/navigation', () => ({
    redirect: jest.fn().mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
    useRouter: jest.fn().mockReturnValue({
        refresh: mockRefreshForPage,
    }),
}));

jest.mock('@frontend/app/actions/access-codes', () => ({
    createAccessCodeAction: jest.fn(),
    deleteAccessCodeAction: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const AccessCodesPage =
    require('@frontend/app/(authenticated)/admin/access-codes/page')
        .default as typeof import('@frontend/app/(authenticated)/admin/access-codes/page').default;
const navigation =
    require('next/navigation') as typeof import('next/navigation');

const mockResolveAuth = jest.mocked(serverAuth.resolveAuth);
const mockRedirect = jest.mocked(navigation.redirect);
const mockUseRouter = jest.mocked(navigation.useRouter);

const now = new Date();
const past = (days: number) =>
    new Date(now.getTime() - days * 86400000).toISOString();
const future = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();

const MOCK_CODES = [
    {
        id: '1',
        code: 'SUMMER25',
        eventName: '2025夏イベント',
        validFrom: past(10),
        validTo: future(10),
    },
    {
        id: '2',
        code: 'SPRING25',
        eventName: '2025春イベント',
        validFrom: past(60),
        validTo: past(30),
    },
];

const originalFetch = global.fetch;

beforeEach(() => {
    jest.resetAllMocks();
    mockRefreshForPage.mockReset();
    mockRedirect.mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    });
    mockUseRouter.mockReturnValue({
        refresh: mockRefreshForPage,
    } as never);
});

afterEach(() => {
    global.fetch = originalFetch;
});

describe('AccessCodesPage', () => {
    it('コード一覧を表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ codes: MOCK_CODES }), {
                status: 200,
            }),
        );

        const element = await AccessCodesPage();
        render(element);

        expect(
            screen.getAllByText('2025夏イベント').length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('SUMMER25').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText('2025春イベント').length,
        ).toBeGreaterThan(0);
    });

    it('コードが空の場合に空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ codes: [] }), { status: 200 }),
        );

        const element = await AccessCodesPage();
        render(element);

        expect(
            screen.getByText('登録されているコードはありません'),
        ).toBeInTheDocument();
    });

    it('fetch 失敗時にエラーメッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(
                JSON.stringify({ error: 'サーバーエラー' }),
                { status: 500 },
            ),
        );

        const element = await AccessCodesPage();
        render(element);

        expect(screen.getByText('サーバーエラー')).toBeInTheDocument();
    });

    it('401/403 が返った場合に /login へリダイレクトする', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 403 }),
        );

        await expect(AccessCodesPage()).rejects.toThrow('NEXT_REDIRECT:/login');
        expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
});
