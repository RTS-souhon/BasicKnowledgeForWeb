import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@frontend/app/actions/dashboard', () => ({
    changePasswordAction: jest.fn(),
    updateUserRoleAction: jest.fn(),
}));

const actions =
    require('@frontend/app/actions/dashboard') as typeof import('@frontend/app/actions/dashboard');
const UserRolePanel =
    require('@frontend/app/(authenticated)/dashboard/UserRolePanel')
        .default as typeof import('@frontend/app/(authenticated)/dashboard/UserRolePanel').default;

const mockUpdateRole = jest.mocked(actions.updateUserRoleAction);

const MOCK_USERS = [
    { id: 'user-1', name: '山田太郎', email: 'yamada@example.com', role: 'user' as const },
    { id: 'user-2', name: '管理者A', email: 'admin@example.com', role: 'admin' as const },
];

beforeEach(() => {
    jest.resetAllMocks();
});

describe('UserRolePanel', () => {
    it('ユーザー一覧を表示する', () => {
        render(<UserRolePanel initialUsers={MOCK_USERS} />);

        expect(screen.getAllByText('山田太郎').length).toBeGreaterThan(0);
        expect(screen.getAllByText('管理者A').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText('yamada@example.com').length,
        ).toBeGreaterThan(0);
    });

    it('各ユーザーに変更ボタンを表示する', () => {
        render(<UserRolePanel initialUsers={MOCK_USERS} />);

        expect(screen.getAllByRole('button', { name: '変更' })).toHaveLength(4);
    });

    it('ユーザーがいない場合に空メッセージを表示する', () => {
        render(<UserRolePanel initialUsers={[]} />);

        expect(
            screen.getByText('登録されているユーザーはありません'),
        ).toBeInTheDocument();
    });

    it('変更ボタンクリックで updateUserRoleAction を呼ぶ', async () => {
        const user = userEvent.setup();
        mockUpdateRole.mockResolvedValue({
            success: true,
            data: Array.from(MOCK_USERS),
        });
        render(<UserRolePanel initialUsers={MOCK_USERS} />);

        const changeButtons = screen.getAllByRole('button', { name: '変更' });
        await act(async () => {
            await user.click(changeButtons[0]);
        });

        await waitFor(() => {
            expect(mockUpdateRole).toHaveBeenCalledWith('user-1', 'user');
        });
    });

    it('ロールを選択して変更ボタンを押すと新しいロールで呼ばれる', async () => {
        const user = userEvent.setup();
        mockUpdateRole.mockResolvedValue({
            success: true,
            data: [
                { ...MOCK_USERS[0], role: 'admin' },
                MOCK_USERS[1],
            ],
        });
        render(<UserRolePanel initialUsers={MOCK_USERS} />);

        const selects = screen.getAllByRole('combobox', {
            name: '山田太郎のロール',
        });
        await user.selectOptions(selects[0], 'admin');

        const changeButtons = screen.getAllByRole('button', { name: '変更' });
        await act(async () => {
            await user.click(changeButtons[0]);
        });

        await waitFor(() => {
            expect(mockUpdateRole).toHaveBeenCalledWith('user-1', 'admin');
        });
    });

    it('アクション失敗時にエラーメッセージを表示する', async () => {
        const user = userEvent.setup();
        mockUpdateRole.mockResolvedValue({
            success: false,
            error: 'ロールの変更に失敗しました',
        });
        render(<UserRolePanel initialUsers={MOCK_USERS} />);

        const changeButtons = screen.getAllByRole('button', { name: '変更' });
        await act(async () => {
            await user.click(changeButtons[0]);
        });

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'ロールの変更に失敗しました',
            );
        });
    });
});
