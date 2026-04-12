import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/actions/access-codes', () => ({
    createAccessCodeAction: jest.fn(),
    deleteAccessCodeAction: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const actions =
    require('@frontend/app/actions/access-codes') as typeof import('@frontend/app/actions/access-codes');
const AccessCodeAdminPanel =
    require('@frontend/app/admin/access-codes/AccessCodeAdminPanel')
        .default as typeof import('@frontend/app/admin/access-codes/AccessCodeAdminPanel').default;
const navigation =
    require('next/navigation') as typeof import('next/navigation');

const mockCreate = jest.mocked(actions.createAccessCodeAction);
const mockDelete = jest.mocked(actions.deleteAccessCodeAction);
const mockUseRouter = jest.mocked(navigation.useRouter);
let mockRefresh: jest.Mock;

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
    {
        id: '3',
        code: 'WINTER25',
        eventName: '2025冬イベント',
        validFrom: future(30),
        validTo: future(60),
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    global.confirm = jest.fn<typeof confirm>().mockReturnValue(true);
    mockRefresh = jest.fn();
    mockUseRouter.mockReturnValue({ refresh: mockRefresh } as never);
});

describe('AccessCodeAdminPanel', () => {
    it('コード一覧を表示する', () => {
        render(<AccessCodeAdminPanel codes={MOCK_CODES} />);

        expect(screen.getAllByText('2025夏イベント').length).toBeGreaterThan(0);
        expect(screen.getAllByText('SUMMER25').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2025春イベント').length).toBeGreaterThan(0);
    });

    it('コードがない場合に空メッセージを表示する', () => {
        render(<AccessCodeAdminPanel codes={[]} />);

        expect(
            screen.getByText('登録されているコードはありません'),
        ).toBeInTheDocument();
    });

    it('ステータスバッジを正しく表示する', () => {
        render(<AccessCodeAdminPanel codes={MOCK_CODES} />);

        expect(screen.getAllByText('有効中').length).toBeGreaterThan(0);
        expect(screen.getAllByText('終了').length).toBeGreaterThan(0);
        expect(screen.getAllByText('準備中').length).toBeGreaterThan(0);
    });

    it('全項目が空の場合にバリデーションエラーを表示する', async () => {
        const user = userEvent.setup();
        render(<AccessCodeAdminPanel codes={[]} />);

        await user.click(screen.getByRole('button', { name: '生成する' }));

        expect(screen.getByRole('alert')).toHaveTextContent(
            'すべての項目を入力してください',
        );
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('終了日が開始日より前の場合にバリデーションエラーを表示する', async () => {
        const user = userEvent.setup();
        render(<AccessCodeAdminPanel codes={[]} />);

        await user.type(screen.getByLabelText('イベント名'), 'テストイベント');
        await user.type(screen.getByLabelText('コード'), 'TEST01');
        await user.type(screen.getByLabelText('有効開始日'), '2025-08-01');
        await user.type(screen.getByLabelText('有効終了日'), '2025-07-01');

        await user.click(screen.getByRole('button', { name: '生成する' }));

        expect(screen.getByRole('alert')).toHaveTextContent(
            '有効終了日は開始日より後にしてください',
        );
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('正常に新規コードを生成できる', async () => {
        const user = userEvent.setup();
        mockCreate.mockResolvedValue({ success: true });
        render(<AccessCodeAdminPanel codes={[]} />);

        await user.type(screen.getByLabelText('イベント名'), 'テストイベント');
        await user.type(screen.getByLabelText('コード'), 'TEST01');
        await user.type(screen.getByLabelText('有効開始日'), '2025-07-01');
        await user.type(screen.getByLabelText('有効終了日'), '2025-08-01');

        await act(async () => {
            await user.click(screen.getByRole('button', { name: '生成する' }));
        });

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'TEST01',
                    eventName: 'テストイベント',
                }),
            );
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('コード重複時にエラーメッセージを表示する', async () => {
        const user = userEvent.setup();
        mockCreate.mockResolvedValue({
            success: false,
            error: 'このコードは既に使用されています',
        });
        render(<AccessCodeAdminPanel codes={[]} />);

        await user.type(screen.getByLabelText('イベント名'), 'テストイベント');
        await user.type(screen.getByLabelText('コード'), 'SUMMER25');
        await user.type(screen.getByLabelText('有効開始日'), '2025-07-01');
        await user.type(screen.getByLabelText('有効終了日'), '2025-08-01');

        await act(async () => {
            await user.click(screen.getByRole('button', { name: '生成する' }));
        });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'このコードは既に使用されています',
            );
        });
    });

    it('自動生成ボタンでコードフィールドが埋まる', async () => {
        const user = userEvent.setup();
        render(<AccessCodeAdminPanel codes={[]} />);

        await user.click(screen.getByRole('button', { name: '自動' }));

        const codeInput = screen.getByLabelText('コード') as HTMLInputElement;
        expect(codeInput.value).toHaveLength(8);
        expect(codeInput.value).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('削除ボタン + confirm で deleteAccessCodeAction を呼ぶ', async () => {
        const user = userEvent.setup();
        mockDelete.mockResolvedValue({ success: true });
        render(<AccessCodeAdminPanel codes={MOCK_CODES} />);

        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        await act(async () => {
            await user.click(deleteButtons[0]);
        });

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('1');
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('confirm キャンセル時は deleteAccessCodeAction を呼ばない', async () => {
        const user = userEvent.setup();
        global.confirm = jest.fn<typeof confirm>().mockReturnValue(false);
        render(<AccessCodeAdminPanel codes={MOCK_CODES} />);

        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        await user.click(deleteButtons[0]);

        expect(mockDelete).not.toHaveBeenCalled();
    });

    it('削除失敗時にエラーメッセージを表示する', async () => {
        const user = userEvent.setup();
        mockDelete.mockResolvedValue({
            success: false,
            error: '削除に失敗しました',
        });
        render(<AccessCodeAdminPanel codes={MOCK_CODES} />);

        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        await act(async () => {
            await user.click(deleteButtons[0]);
        });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                '削除に失敗しました',
            );
        });
    });

    it('initialError があれば一覧上部に表示する', () => {
        render(
            <AccessCodeAdminPanel
                codes={[]}
                initialError='取得に失敗しました'
            />,
        );

        expect(
            screen.getByText('取得に失敗しました'),
        ).toBeInTheDocument();
    });
});
