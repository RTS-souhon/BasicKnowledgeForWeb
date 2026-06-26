import type { AppType } from '@backend/src';
import {
    getPublicApiBaseUrl,
    withNoStoreRequestInit,
} from '@frontend/app/lib/backendFetch';
import { hc } from 'hono/client';

const noStoreFetch: typeof fetch = (input, init) =>
    fetch(input, withNoStoreRequestInit(init));

export const client = hc<AppType>(getPublicApiBaseUrl(), {
    fetch: noStoreFetch,
    init: {
        credentials: 'include',
    },
});
