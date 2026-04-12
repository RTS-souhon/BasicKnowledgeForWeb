import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@frontend/app/lib/serverAuth', () => ({
    resolveAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn().mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
}));

jest.mock('@frontend/app/actions/access-codes', () => ({
    createAccessCodeAction: jest.fn(),
    deleteAccessCodeAction: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const AccessCodesPage =
    require('@frontend/app/admin/access-codes/page')
        .default as typeof import('@frontend/app/admin/access-codes/page').default;

const mockResolveAuth = jest.mocked(serverAuth.resolveAuth);

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

    it('fetch 失敗時に空メッセージを表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 403 }),
        );

        const element = await AccessCodesPage();
        render(element);

        expect(
            screen.getByText('登録されているコードはありません'),
        ).toBeInTheDocument();
    });
});
