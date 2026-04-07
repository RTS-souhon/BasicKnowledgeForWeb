import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock('@frontend/app/(authenticated)/auth-context', () => ({
    useAuthContext: jest.fn(),
}));

const navigation =
    require('next/navigation') as jest.Mocked<typeof import('next/navigation')>;
const mockUseSearchParams = navigation.useSearchParams;
const mockUseRouter = navigation.useRouter;
const mockUsePathname = navigation.usePathname;

const authContext = require('@frontend/app/(authenticated)/auth-context') as {
    useAuthContext: jest.MockedFunction<() => {
        role: string;
        userEventId: string | null;
    }>;
};
const mockUseAuthContext = authContext.useAuthContext;

const SearchPage =
    require('@frontend/app/(authenticated)/search/page').default as typeof import('@frontend/app/(authenticated)/search/page').default;

const mockRouterReplace = jest.fn();

const mockResponse = (body: unknown) =>
    ({
        ok: true,
        json: () => Promise.resolve(body),
    }) as Response;

describe('SearchPage', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
        mockUseSearchParams.mockReturnValue(new URLSearchParams());
        mockUseRouter.mockReturnValue({ replace: mockRouterReplace });
        mockUsePathname.mockReturnValue('/search');
        mockUseAuthContext.mockReturnValue({ role: 'user', userEventId: 'event-1' });
        global.fetch = jest.fn();
        mockRouterReplace.mockReset();
    });

    it('検索フォームを描画し、空クエリではボタンを無効にする', () => {
        render(<SearchPage />);
        expect(screen.getByLabelText('検索キーワード')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('クエリが存在すると検索 API を呼び出し結果を表示する', async () => {
        mockUseSearchParams.mockReturnValue(new URLSearchParams('q=room'));
        (global.fetch as jest.Mock).mockResolvedValue(
            mockResponse({
                timetable: [
                    {
                        id: 'tt-1',
                        title: '開会式',
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        location: '会場A',
                        description: null,
                    },
                ],
                rooms: [],
                programs: [],
                shopItems: [],
                otherItems: [],
            }),
        );

        render(<SearchPage />);

        await waitFor(() =>
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/search?q=room'),
                expect.objectContaining({
                    headers: expect.objectContaining({ 'x-event-id': 'event-1' }),
                }),
            ),
        );

        expect(await screen.findByText('タイムテーブル')).toBeInTheDocument();
        expect(await screen.findByText('開会式')).toBeInTheDocument();
    });

    it('全カテゴリ0件のとき空状態を表示する', async () => {
        mockUseSearchParams.mockReturnValue(new URLSearchParams('q=none'));
        (global.fetch as jest.Mock).mockResolvedValue(
            mockResponse({
                timetable: [],
                rooms: [],
                programs: [],
                shopItems: [],
                otherItems: [],
            }),
        );

        render(<SearchPage />);

        await waitFor(() =>
            expect(
                screen.getByText('該当する情報が見つかりません'),
            ).toBeInTheDocument(),
        );
    });

    it('検索ボタンを押すと URL クエリが更新される', async () => {
        const user = userEvent.setup();
        render(<SearchPage />);

        const input = screen.getByLabelText('検索キーワード');
        await user.type(input, 'rooms');
        await user.click(screen.getByRole('button', { name: '検索' }));

        expect(mockRouterReplace).toHaveBeenCalledWith('/search?q=rooms');
    });
});
