'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function changePasswordAction(data: {
    currentPassword: string;
    newPassword: string;
}): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/auth/password`, {
            method: 'PUT',
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
                error: body.error ?? 'パスワードの変更に失敗しました',
            };
        }
        return { success: true };
    } catch {
        return { success: false, error: 'パスワードの変更に失敗しました' };
    }
}

export async function updateUserRoleAction(
    userId: string,
    role: 'user' | 'admin',
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
            },
            body: JSON.stringify({ role }),
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? 'ロールの変更に失敗しました',
            };
        }
        revalidatePath('/dashboard');
        return { success: true };
    } catch {
        return { success: false, error: 'ロールの変更に失敗しました' };
    }
}
