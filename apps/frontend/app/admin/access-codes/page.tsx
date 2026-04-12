import { resolveAuth } from '@frontend/app/lib/serverAuth';
import AccessCodeAdminPanel from './AccessCodeAdminPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type AccessCode = {
    id: string;
    code: string;
    eventName: string;
    validFrom: string;
    validTo: string;
};

async function fetchAccessCodes(authToken: string): Promise<AccessCode[]> {
    try {
        const res = await fetch(`${API_URL}/api/access-codes`, {
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

export default async function AccessCodesPage() {
    const { authToken } = await resolveAuth();
    // layout.tsx でガード済みなので authToken は必ず存在する
    const codes = await fetchAccessCodes(authToken!);

    return <AccessCodeAdminPanel codes={codes} />;
}
