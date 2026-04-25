'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
    src: string;
    alt: string;
    sizes: string;
    thumbnailClassName?: string;
    modalImageClassName?: string;
    ariaLabel?: string;
};

export default function TapToZoomImage({
    src,
    alt,
    sizes,
    thumbnailClassName = 'object-cover',
    modalImageClassName = 'object-contain',
    ariaLabel,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    return (
        <>
            <button
                type='button'
                onClick={() => setIsOpen(true)}
                className='group relative block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                aria-label={ariaLabel ?? `${alt} を拡大表示`}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    className={thumbnailClassName}
                    unoptimized
                />
            </button>
            {isOpen && (
                <div
                    role='dialog'
                    aria-modal='true'
                    aria-label={`${alt} の拡大表示`}
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        type='button'
                        className='absolute right-4 top-4 rounded-md bg-background/90 px-3 py-2 font-medium text-foreground text-sm'
                        onClick={() => setIsOpen(false)}
                    >
                        閉じる
                    </button>
                    <div
                        className='relative h-[min(82vh,1080px)] w-[min(94vw,1600px)]'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            sizes='100vw'
                            className={modalImageClassName}
                            unoptimized
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}
