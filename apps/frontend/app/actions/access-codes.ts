'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function createAccessCodeAction(data: {
    code: string;
    eventName: string;
    validFrom: string;
    validTo: string;
}): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/access-codes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? 'コードの作成に失敗しました',
            };
        }
        revalidatePath('/admin/access-codes');
        return { success: true };
    } catch {
        return { success: false, error: 'コードの作成に失敗しました' };
    }
}

export async function deleteAccessCodeAction(
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/access-codes/${id}`, {
            method: 'DELETE',
            headers: { Cookie: `auth_token=${authToken}` },
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidatePath('/admin/access-codes');
        return { success: true };
    } catch {
        return { success: false, error: '削除に失敗しました' };
    }
}
