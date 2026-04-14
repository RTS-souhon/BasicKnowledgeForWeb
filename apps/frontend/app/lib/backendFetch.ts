const FALLBACK_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type CloudflareContext = {
    env?: CloudflareEnv;
};

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for('__cloudflare-context__');

const getCloudflareContext = (): CloudflareContext | undefined => {
    if (typeof globalThis === 'undefined') {
        return undefined;
    }
    const globalContext = globalThis as Record<string | symbol, unknown>;
    return globalContext[CLOUDFLARE_CONTEXT_SYMBOL] as
        | CloudflareContext
        | undefined;
};

const isAbsoluteUrl = (target: string) => /^https?:\/\//.test(target);

const buildAbsoluteUrl = (target: string) => {
    if (isAbsoluteUrl(target)) {
        return target;
    }
    return `${FALLBACK_API_BASE_URL}${target.startsWith('/') ? '' : '/'}${target}`;
};

export const getPublicApiBaseUrl = () => FALLBACK_API_BASE_URL;
export const buildBackendUrl = (target: string) => buildAbsoluteUrl(target);

export async function fetchFromBackend(
    target: string,
    init?: RequestInit,
): Promise<Response> {
    const url = buildAbsoluteUrl(target);

    if (typeof window === 'undefined') {
        try {
            const context = getCloudflareContext();
            const backend = context?.env?.BACKEND;
            if (backend) {
                const request = new Request(url, init);
                const backendFetch = backend.fetch.bind(
                    backend,
                ) as unknown as typeof fetch;
                return backendFetch(request);
            }
        } catch {
            // Cloudflare 環境以外（ローカルなど）は通常の fetch にフォールバック
        }
    }

    return fetch(url, init);
}
