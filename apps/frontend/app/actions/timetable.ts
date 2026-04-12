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

export async function createTimetableItemAction(
    eventId: string,
    data: {
        title: string;
        start_time: string;
        end_time: string;
        location: string;
        description?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/timetable`;
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
        logAction('createTimetableItemAction', 'POST', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '登録に失敗しました',
            };
        }
        revalidatePath('/timetable');
        return { success: true };
    } catch (err) {
        logActionError('createTimetableItemAction', 'POST', url, err);
        return { success: false, error: '登録に失敗しました' };
    }
}

export async function updateTimetableItemAction(
    eventId: string,
    id: string,
    data: {
        title?: string;
        start_time?: string;
        end_time?: string;
        location?: string;
        description?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/timetable/${id}`;
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
        logAction('updateTimetableItemAction', 'PUT', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '更新に失敗しました',
            };
        }
        revalidatePath('/timetable');
        return { success: true };
    } catch (err) {
        logActionError('updateTimetableItemAction', 'PUT', url, err);
        return { success: false, error: '更新に失敗しました' };
    }
}

export async function deleteTimetableItemAction(
    eventId: string,
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const url = `${API_URL}/api/timetable/${id}`;
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
        });
        logAction('deleteTimetableItemAction', 'DELETE', url, res.status);
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidatePath('/timetable');
        return { success: true };
    } catch (err) {
        logActionError('deleteTimetableItemAction', 'DELETE', url, err);
        return { success: false, error: '削除に失敗しました' };
    }
}
