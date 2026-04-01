import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessPage from '@frontend/app/access/page';

const push = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

describe('AccessPage', () => {
    beforeEach(() => {
        push.mockReset();
    });

    it('フォームフィールドが正しくレンダリングされること', () => {
        render(<AccessPage />);

        expect(screen.getByLabelText('アクセスコード')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '入力する' })).toBeInTheDocument();
    });

    it('空送信時にバリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        render(<AccessPage />);

        await user.click(screen.getByRole('button', { name: '入力する' }));

        await waitFor(() => {
            expect(
                screen.getByText('アクセスコードを入力してください'),
            ).toBeInTheDocument();
        });
    });

    it('正しいアクセスコードで送信するとトップページへ遷移すること', async () => {
        const user = userEvent.setup();
        render(<AccessPage />);

        await user.type(screen.getByLabelText('アクセスコード'), 'SUMMER2025');
        await user.click(screen.getByRole('button', { name: '入力する' }));

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/');
        });
    });

    it('期限切れコードではエラーメッセージが表示されること', async () => {
        const user = userEvent.setup();
        render(<AccessPage />);

        await user.type(screen.getByLabelText('アクセスコード'), 'EXPIRED2025');
        await user.click(screen.getByRole('button', { name: '入力する' }));

        await waitFor(() => {
            expect(
                screen.getByText('アクセスコードの有効期限が切れています'),
            ).toBeInTheDocument();
        });
        expect(push).not.toHaveBeenCalled();
    });
});
