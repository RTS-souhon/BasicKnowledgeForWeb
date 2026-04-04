import { logoutAction } from '@frontend/app/actions/auth';
import { AuthHeader } from '@frontend/components/AuthHeader';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';

type AuthPayload = { id: string; name: string; role: string; exp: number };
type AccessPayload = { event_id: string; exp: number };

function decodeJwtPayload<T>(token: string): T | null {
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

type AccessCode = { id: string; eventName: string };

async function fetchAccessCodes(authToken: string): Promise<AccessCode[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/access-codes`, {
            headers: { Cookie: `auth_token=${authToken}` },
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { codes: AccessCode[] };
        return data.codes ?? [];
    } catch {
        return [];
    }
}

export default async function AuthenticatedLayout({
    children,
}: {
    children: ReactNode;
}) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const accessToken = cookieStore.get('access_token')?.value;

    const authPayload = authToken
        ? decodeJwtPayload<AuthPayload>(authToken)
        : null;
    const accessPayload = accessToken
        ? decodeJwtPayload<AccessPayload>(accessToken)
        : null;

    const role = authPayload?.role ?? 'user';
    const userName = authPayload?.name ?? null;
    const userEventId = accessPayload?.event_id ?? null;

    const isPrivileged = role === 'admin' || role === 'developer';
    const accessCodes: AccessCode[] =
        isPrivileged && authToken ? await fetchAccessCodes(authToken) : [];

    return (
        <div className='min-h-screen bg-background'>
            <AuthHeader
                role={role}
                userName={userName}
                userEventId={userEventId}
                accessCodes={accessCodes}
                logoutAction={logoutAction}
            />
            <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6'>
                {children}
            </main>
        </div>
    );
}
