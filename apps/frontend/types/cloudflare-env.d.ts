import type { Fetcher } from '@cloudflare/workers-types';

declare global {
    interface CloudflareEnv {
        BACKEND: Fetcher;
    }
}

export {};
