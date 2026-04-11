'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type ActionResult = { success: true } | { success: false; error: string };
type UploadUrlResult =
    | {
          success: true;
          uploadUrl: string;
          imageKey: string;
          headers: Record<string, string>;
      }
    | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function getShopItemUploadUrlAction(
    eventId: string,
    fileName?: string,
    contentType?: string,
): Promise<UploadUrlResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const params = new URLSearchParams();
        if (fileName) params.set('file_name', fileName);
        if (contentType) params.set('content_type', contentType);
        const query = params.size > 0 ? `?${params}` : '';

        const res = await fetch(
            `${API_URL}/api/shop-items/upload-url${query}`,
            {
                headers: {
                    Cookie: `auth_token=${authToken}`,
                    'x-event-id': eventId,
                },
            },
        );
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? 'アップロードURLの取得に失敗しました',
            };
        }
        const body = (await res.json()) as {
            uploadUrl: string;
            imageKey: string;
            headers: Record<string, string>;
        };
        return {
            success: true,
            uploadUrl: body.uploadUrl,
            imageKey: body.imageKey,
            headers: body.headers,
        };
    } catch {
        return {
            success: false,
            error: 'アップロードURLの取得に失敗しました',
        };
    }
}

export async function createShopItemAction(
    eventId: string,
    data: {
        name: string;
        price: number;
        stock_status: 'available' | 'low' | 'sold_out';
        image_key: string;
        description?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/shop-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify({ event_id: eventId, ...data }),
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '登録に失敗しました',
            };
        }
        revalidatePath('/shop');
        return { success: true };
    } catch {
        return { success: false, error: '登録に失敗しました' };
    }
}

export async function updateShopItemAction(
    eventId: string,
    id: string,
    data: {
        name?: string;
        price?: number;
        stock_status?: 'available' | 'low' | 'sold_out';
        image_key?: string;
        description?: string | null;
    },
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/shop-items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '更新に失敗しました',
            };
        }
        revalidatePath('/shop');
        return { success: true };
    } catch {
        return { success: false, error: '更新に失敗しました' };
    }
}

export async function deleteShopItemAction(
    eventId: string,
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    try {
        const res = await fetch(`${API_URL}/api/shop-items/${id}`, {
            method: 'DELETE',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
        });
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidatePath('/shop');
        return { success: true };
    } catch {
        return { success: false, error: '削除に失敗しました' };
    }
}
