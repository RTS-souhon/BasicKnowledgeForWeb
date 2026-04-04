import { cookies } from 'next/headers';

type AuthPayload = { id: string; name: string; role: string; exp: number };
type AccessPayload = { event_id: string; exp: number };

export function decodeJwtPayload<T>(token: string): T | null {
    try {
        const base64 = token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        return JSON.parse(atob(base64)) as T;
    } catch {
        return null;
    }
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
    const authToken = cookieStore.get('auth_token')?.value ?? null;
    const accessToken = cookieStore.get('access_token')?.value ?? null;

    const authPayload = authToken
        ? decodeJwtPayload<AuthPayload>(authToken)
        : null;
    const accessPayload = accessToken
        ? decodeJwtPayload<AccessPayload>(accessToken)
        : null;

    const role = authPayload?.role ?? 'user';
    const isPrivileged = role === 'admin' || role === 'developer';

    const eventId = isPrivileged
        ? (searchParamEventId ?? null)
        : (accessPayload?.event_id ?? null);

    return { eventId, authToken, accessToken, role };
}

export function buildContentFetchHeaders(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): HeadersInit {
    const isPrivileged = role === 'admin' || role === 'developer';
    const cookieHeader = isPrivileged
        ? `auth_token=${authToken}`
        : `access_token=${accessToken}`;
    return {
        Cookie: cookieHeader,
        'x-event-id': eventId,
    };
}
