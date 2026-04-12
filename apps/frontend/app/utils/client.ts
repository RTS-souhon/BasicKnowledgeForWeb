import type { AppType } from '@backend/src';
import { getPublicApiBaseUrl } from '@frontend/app/lib/backendFetch';
import { hc } from 'hono/client';

export const client = hc<AppType>(getPublicApiBaseUrl(), {
    init: {
        credentials: 'include',
    },
});
