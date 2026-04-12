'use server';

import { logAction, logActionError } from '@frontend/app/lib/actionLogger';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type ActionResult = { success: true } | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function createRoomAction(
    eventId: string,
    data: {
        building_name: string;
        floor: string;
        room_name: string;
        day_manager_id: string;
        day_purpose: string;
        pre_day_manager_id?: string | null;
        pre_day_purpose?: string | null;
        notes?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/rooms`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify({ event_id: eventId, ...data }),
        });
        logAction('createRoomAction', 'POST', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '登録に失敗しました',
            };
        }
        revalidatePath('/rooms');
        return { success: true };
    } catch (err) {
        logActionError('createRoomAction', 'POST', url, err);
        return { success: false, error: '登録に失敗しました' };
    }
}

export async function updateRoomAction(
    eventId: string,
    id: string,
    data: {
        building_name?: string;
        floor?: string;
        room_name?: string;
        day_manager_id?: string;
        day_purpose?: string;
        pre_day_manager_id?: string | null;
        pre_day_purpose?: string | null;
        notes?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/rooms/${id}`;
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify(data),
        });
        logAction('updateRoomAction', 'PUT', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '更新に失敗しました',
            };
        }
        revalidatePath('/rooms');
        return { success: true };
    } catch (err) {
        logActionError('updateRoomAction', 'PUT', url, err);
        return { success: false, error: '更新に失敗しました' };
    }
}

export async function deleteRoomAction(
    eventId: string,
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/rooms/${id}`;
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
        });
        logAction('deleteRoomAction', 'DELETE', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidatePath('/rooms');
        return { success: true };
    } catch (err) {
        logActionError('deleteRoomAction', 'DELETE', url, err);
        return { success: false, error: '削除に失敗しました' };
    }
}
