'use server';

import { fetchFromBackend } from '@frontend/app/lib/apiClient';
import { logAction, logActionError } from '@frontend/app/lib/actionLogger';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function createOtherItemAction(
    eventId: string,
    data: { title: string; content: string; display_order: number },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = '/api/others';
    try {
        const res = await fetchFromBackend(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify({ event_id: eventId, ...data }),
        });
        logAction('createOtherItemAction', 'POST', endpoint, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '登録に失敗しました',
            };
        }
        revalidatePath('/others');
        return { success: true };
    } catch (err) {
        logActionError('createOtherItemAction', 'POST', endpoint, err);
        return { success: false, error: '登録に失敗しました' };
    }
}

export async function updateOtherItemAction(
    eventId: string,
    id: string,
    data: { title?: string; content?: string; display_order?: number },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = `/api/others/${id}`;
    try {
        const res = await fetchFromBackend(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify(data),
        });
        logAction('updateOtherItemAction', 'PUT', endpoint, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '更新に失敗しました',
            };
        }
        revalidatePath('/others');
        return { success: true };
    } catch (err) {
        logActionError('updateOtherItemAction', 'PUT', endpoint, err);
        return { success: false, error: '更新に失敗しました' };
    }
}

export async function deleteOtherItemAction(
    eventId: string,
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = `/api/others/${id}`;
    try {
        const res = await fetchFromBackend(endpoint, {
            method: 'DELETE',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
        });
        logAction('deleteOtherItemAction', 'DELETE', endpoint, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidatePath('/others');
        return { success: true };
    } catch (err) {
        logActionError('deleteOtherItemAction', 'DELETE', endpoint, err);
        return { success: false, error: '削除に失敗しました' };
    }
}
