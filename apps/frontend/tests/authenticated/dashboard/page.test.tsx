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

jest.mock('@frontend/app/actions/dashboard', () => ({
    changePasswordAction: jest.fn(),
    updateUserRoleAction: jest.fn(),
}));

const serverAuth =
    require('@frontend/app/lib/serverAuth') as typeof import('@frontend/app/lib/serverAuth');
const navigation =
    require('next/navigation') as { redirect: ReturnType<typeof jest.fn> };
const DashboardPage =
    require('@frontend/app/(authenticated)/dashboard/page')
        .default as typeof import('@frontend/app/(authenticated)/dashboard/page').default;

const mockResolveAuth = jest.mocked(serverAuth.resolveAuth);
const mockRedirect = navigation.redirect as ReturnType<typeof jest.fn>;

const MOCK_ME = {
    id: 'user-1',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'user',
};

const MOCK_USERS = [
    { id: 'user-1', name: '山田太郎', email: 'yamada@example.com', role: 'user' },
    { id: 'user-2', name: '管理者A', email: 'admin@example.com', role: 'admin' },
];

const originalFetch = global.fetch;

beforeEach(() => {
    jest.resetAllMocks();
    mockRedirect.mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    });
});

afterEach(() => {
    global.fetch = originalFetch;
});

describe('DashboardPage', () => {
    it('authToken がない場合 /login にリダイレクトする', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: null,
            accessToken: null,
            eventId: null,
            role: 'user',
        });

        await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login');
    });

    it('プロフィール情報（名前・メール・ロール）を表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'user',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify(MOCK_ME), { status: 200 }),
        );

        const element = await DashboardPage();
        render(element);

        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
        expect(screen.getByText('スタッフ')).toBeInTheDocument();
    });

    it('パスワード変更フォームを表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'user',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify(MOCK_ME), { status: 200 }),
        );

        const element = await DashboardPage();
        render(element);

        expect(screen.getByLabelText('現在のパスワード')).toBeInTheDocument();
        expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
        expect(screen.getByLabelText('確認')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '変更する' }),
        ).toBeInTheDocument();
    });

    it('user ロール時にユーザー管理・管理メニューが表示されない', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'user',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify(MOCK_ME), { status: 200 }),
        );

        const element = await DashboardPage();
        render(element);

        expect(screen.queryByText('ユーザー管理')).not.toBeInTheDocument();
        expect(screen.queryByText('管理メニュー')).not.toBeInTheDocument();
        expect(
            screen.queryByText('アクセスコード管理 →'),
        ).not.toBeInTheDocument();
    });

    it('admin ロール時にユーザー管理と管理メニューが表示される', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ ...MOCK_ME, role: 'admin' }),
                    { status: 200 },
                ),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ users: MOCK_USERS }),
                    { status: 200 },
                ),
            );

        const element = await DashboardPage();
        render(element);

        expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
        expect(screen.getByText('管理メニュー')).toBeInTheDocument();
        expect(
            screen.getByText('アクセスコード管理 →'),
        ).toBeInTheDocument();
    });

    it('admin ロール時にユーザー一覧を表示する', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'admin',
        });
        global.fetch = jest
            .fn<typeof fetch>()
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ ...MOCK_ME, role: 'admin' }),
                    { status: 200 },
                ),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ users: MOCK_USERS }),
                    { status: 200 },
                ),
            );

        const element = await DashboardPage();
        render(element);

        expect(screen.getAllByText('山田太郎').length).toBeGreaterThan(0);
        expect(screen.getAllByText('管理者A').length).toBeGreaterThan(0);
        expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0);
    });

    it('/api/auth/me が失敗した場合 /login にリダイレクトする', async () => {
        mockResolveAuth.mockResolvedValue({
            authToken: 'auth-token',
            accessToken: null,
            eventId: null,
            role: 'user',
        });
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue(
            new Response(null, { status: 401 }),
        );

        await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login');
    });
});
