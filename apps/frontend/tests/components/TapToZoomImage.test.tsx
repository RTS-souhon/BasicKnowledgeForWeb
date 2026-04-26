import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TapToZoomImage from '@frontend/components/TapToZoomImage';

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt }: { src: string; alt: string }) => (
        // biome-ignore lint/a11y/useAltText: テスト用モック
        <img src={src} alt={alt} />
    ),
}));

describe('TapToZoomImage', () => {
    it('タップで拡大表示し、Escape で閉じる', async () => {
        const user = userEvent.setup();

        render(
            <div className='h-40 w-40'>
                <TapToZoomImage
                    src='https://example.com/sample.png'
                    alt='サンプル画像'
                    sizes='160px'
                />
            </div>,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'サンプル画像 を拡大表示' }),
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getAllByAltText('サンプル画像')).toHaveLength(2);

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('拡大後に画像フレーム領域をタップすると閉じる', async () => {
        const user = userEvent.setup();

        render(
            <div className='h-40 w-40'>
                <TapToZoomImage
                    src='https://example.com/sample.png'
                    alt='サンプル画像'
                    sizes='160px'
                />
            </div>,
        );

        await user.click(
            screen.getByRole('button', { name: 'サンプル画像 を拡大表示' }),
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await user.click(screen.getByTestId('zoom-modal-frame'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
