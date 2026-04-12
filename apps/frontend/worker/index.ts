import type { ExecutionContext } from '@cloudflare/workers-types';
import type { Env as CloudflareEnv } from './types';

const API_PREFIX = '/api';

const openNextWorker = await import('../.open-next/worker.js');

function shouldProxy(pathname: string): boolean {
    return pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`);
}

function ensureBinding(env: CloudflareEnv): asserts env is CloudflareEnv & {
    BACKEND: NonNullable<CloudflareEnv['BACKEND']>;
} {
    if (!env.BACKEND) {
        throw new Error('BACKEND service binding is not configured.');
    }
}

export default {
    async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        if (shouldProxy(url.pathname)) {
            ensureBinding(env);
            return env.BACKEND.fetch(request);
        }

        return openNextWorker.default.fetch(request, env, ctx);
    },
};
