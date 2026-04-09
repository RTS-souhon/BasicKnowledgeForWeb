import { cookies } from 'next/headers';

export type AuthPayload = {
    id: string;
    name: string;
    role: string;
    exp?: number;
};
export type AccessPayload = { event_id: string; exp?: number };

const textDecoder = new TextDecoder();

function normalizeBase64(input: string): string {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4)) % 4;
    return normalized.padEnd(normalized.length + padding, '=');
}

export function decodeJwtPayload<T>(token: string): T | null {
    try {
        const segment = token.split('.')[1];
        if (!segment) return null;
        const base64 = normalizeBase64(segment);
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const json = textDecoder.decode(bytes);
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}

function isTokenExpired(payload: { exp?: number } | null): boolean {
    if (!payload?.exp) {
        return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
}

export type ResolvedAuth = {
    eventId: string | null;
    authToken: string | null;
    accessToken: string | null;
    role: string;
};

export async function resolveAuth(
    searchParamEventId?: string,
): Promise<ResolvedAuth> {
    const cookieStore = await cookies();
    const rawAuthToken = cookieStore.get('auth_token')?.value ?? null;
    const rawAccessToken = cookieStore.get('access_token')?.value ?? null;

    const authPayload = rawAuthToken
        ? decodeJwtPayload<AuthPayload>(rawAuthToken)
        : null;
    const accessPayload = rawAccessToken
        ? decodeJwtPayload<AccessPayload>(rawAccessToken)
        : null;

    const validAuthPayload =
        authPayload && !isTokenExpired(authPayload) ? authPayload : null;
    const validAccessPayload =
        accessPayload && !isTokenExpired(accessPayload) ? accessPayload : null;

    const authToken = validAuthPayload ? rawAuthToken : null;
    const accessToken = validAccessPayload ? rawAccessToken : null;

    const role = validAuthPayload?.role ?? 'user';
    const isPrivileged = role === 'admin';

    const eventId = isPrivileged
        ? (searchParamEventId ?? null)
        : (validAccessPayload?.event_id ?? null);

    return { eventId, authToken, accessToken, role };
}

export function buildContentFetchHeaders(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): HeadersInit {
    const isPrivileged = role === 'admin';
    const headers: HeadersInit = {
        'x-event-id': eventId,
    };

    if (isPrivileged) {
        if (authToken) {
            headers.Cookie = `auth_token=${authToken}`;
        }
    } else if (accessToken) {
        headers.Cookie = `access_token=${accessToken}`;
    }

    return headers;
}
