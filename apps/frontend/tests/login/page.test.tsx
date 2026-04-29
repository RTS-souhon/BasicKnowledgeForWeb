import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@frontend/app/login/page';

const push = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        push.mockReset();
    });

    it('フォームフィールドが正しくレンダリングされること', () => {
        render(<LoginPage />);

        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'こちら' })).toHaveAttribute(
            'href',
            '/access',
        );
    });

    it('hidden command として register を入力すると登録ページへ遷移すること', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.keyboard('register');

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/register');
        });
    });

    it('メールアドレス入力中に register を入力しても登録ページへ遷移しないこと', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(screen.getByLabelText('メールアドレス'), 'register');

        expect(push).not.toHaveBeenCalledWith('/register');
    });

    it('空送信時にバリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.click(screen.getByRole('button', { name: 'ログイン' }));

        await waitFor(() => {
            expect(
                screen.getByText('有効なメールアドレスを入力してください'),
            ).toBeInTheDocument();
        });
    });

    it('正常な入力で送信するとダッシュボードへ遷移すること', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(
            screen.getByLabelText('メールアドレス'),
            'admin@example.com',
        );
        await user.type(screen.getByLabelText('パスワード'), 'password123');
        await user.click(screen.getByRole('button', { name: 'ログイン' }));

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('認証エラー時にフォーム上部へエラーが表示されること', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(
            screen.getByLabelText('メールアドレス'),
            'admin@example.com',
        );
        await user.type(screen.getByLabelText('パスワード'), 'wrong-password');
        await user.click(screen.getByRole('button', { name: 'ログイン' }));

        await waitFor(() => {
            expect(
                screen.getByText('メールアドレスまたはパスワードが正しくありません'),
            ).toBeInTheDocument();
        });
        expect(push).not.toHaveBeenCalled();
    });
});
