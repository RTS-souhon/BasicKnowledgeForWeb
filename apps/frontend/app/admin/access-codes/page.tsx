import { resolveAuth } from '@frontend/app/lib/serverAuth';
import { redirect } from 'next/navigation';
import AccessCodeAdminPanel from './AccessCodeAdminPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type AccessCode = {
    id: string;
    code: string;
    eventName: string;
    validFrom: string;
    validTo: string;
};

type FetchResult = { codes: AccessCode[]; error: string | null };

async function fetchAccessCodes(authToken: string): Promise<FetchResult> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}/api/access-codes`, {
            headers: { Cookie: `auth_token=${authToken}` },
            cache: 'no-store',
        });
    } catch {
        return { codes: [], error: 'アクセスコードの取得に失敗しました' };
    }

    if (res.status === 401 || res.status === 403) {
        redirect('/login');
    }
    if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
        return {
            codes: [],
            error: body?.error ?? 'アクセスコードの取得に失敗しました',
        };
    }
    const data = (await res.json()) as { codes: AccessCode[] };
    return { codes: data.codes ?? [], error: null };
}

export default async function AccessCodesPage() {
    const { authToken } = await resolveAuth();
    if (!authToken) {
        redirect('/login');
    }
    const { codes, error } = await fetchAccessCodes(authToken);

    return <AccessCodeAdminPanel codes={codes} initialError={error} />;
}
