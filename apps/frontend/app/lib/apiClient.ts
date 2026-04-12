import { getCloudflareContext } from '@opennextjs/cloudflare';

const LOCAL_FALLBACK_ORIGIN =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const BINDING_BASE_URL = 'https://basic-knowledge-backend.internal';

type BindingFetcher =
    | {
          fetch(
              input: Request | string | URL,
              init?: RequestInit,
          ): Promise<Response>;
      }
    | undefined
    | null;

type FetchOptions = RequestInit;

function ensureAbsolutePath(path: string): void {
    if (!path.startsWith('/')) {
        throw new Error(`API パスには先頭に"/"が必要です: ${path}`);
    }
}

function cloneHeaders(input?: HeadersInit): Headers | undefined {
    if (!input) return undefined;
    return input instanceof Headers ? input : new Headers(input);
}

function getBindingFetcher(): BindingFetcher {
    try {
        const context = getCloudflareContext();
        return context.env.BACKEND ?? null;
    } catch {
        return null;
    }
}

async function fetchViaBinding(path: string, init?: FetchOptions): Promise<Response | null> {
    const binding = getBindingFetcher();
    if (!binding) return null;

    const headers = cloneHeaders(init?.headers);
    const requestInit: RequestInit = {
        ...init,
        headers,
    };
    const targetUrl = new URL(path, BINDING_BASE_URL);
    return binding.fetch(targetUrl.toString(), requestInit);
}

function getLocalOrigin(): string {
    if (LOCAL_FALLBACK_ORIGIN) {
        return LOCAL_FALLBACK_ORIGIN;
    }
    throw new Error('Cloudflare バインディングと NEXT_PUBLIC_API_URL の両方を利用できません。');
}

export async function fetchFromBackend(path: string, init?: FetchOptions): Promise<Response> {
    ensureAbsolutePath(path);
    const bindingResponse = await fetchViaBinding(path, init);
    if (bindingResponse) {
        return bindingResponse;
    }
    const origin = getLocalOrigin();
    return fetch(`${origin}${path}`, init);
}
