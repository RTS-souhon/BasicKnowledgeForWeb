'use client';

import { useTheme } from '@frontend/app/providers/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            type='button'
            aria-label={
                theme === 'dark'
                    ? 'ライトモードに切り替え'
                    : 'ダークモードに切り替え'
            }
            onClick={toggle}
            className='rounded-sm p-1.5 opacity-60 transition-opacity hover:opacity-100'
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
