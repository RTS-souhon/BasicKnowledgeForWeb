import type { AppType } from '@backend/src';
import { hc } from 'hono/client';

const API_BASE_URL =
    typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
        : '';

export const client = hc<AppType>(API_BASE_URL, {
    init: {
        credentials: 'include',
    },
});
