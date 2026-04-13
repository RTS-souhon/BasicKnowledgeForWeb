'use server';

import { logAction, logActionError } from '@frontend/app/lib/actionLogger';
import {
    buildBackendUrl,
    fetchFromBackend,
} from '@frontend/app/lib/backendFetch';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

type ActionResult = { success: true } | { success: false; error: string };
type UploadImageResult =
    | { success: true; imageKey: string }
    | { success: false; error: string };

type ShopItemData = {
    id: string;
    name: string;
    price: number;
    stockStatus: 'available' | 'low' | 'sold_out';
    description: string | null;
    imageUrl: string;
};

type MutationResult =
    | { success: true; data: ShopItemData }
    | { success: false; error: string };

function revalidateShopPage(_eventId: string) {
    revalidatePath('/shop', 'layout');
}

async function getAuthToken(): Promise<string | null> {
    const store = await cookies();
    return store.get('auth_token')?.value ?? null;
}

export async function uploadShopItemImageAction(
    eventId: string,
    formData: FormData,
): Promise<UploadImageResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = '/api/shop-items/upload';
    try {
        const res = await fetchFromBackend(endpoint, {
            method: 'POST',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
            body: formData,
        });
        logAction(
            'uploadShopItemImageAction',
            'POST',
            buildBackendUrl(endpoint),
            res.status,
        );
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '画像のアップロードに失敗しました',
            };
        }
        const body = (await res.json()) as { imageKey: string };
        return { success: true, imageKey: body.imageKey };
    } catch (err) {
        logActionError(
            'uploadShopItemImageAction',
            'POST',
            buildBackendUrl(endpoint),
            err,
        );
        return { success: false, error: '画像のアップロードに失敗しました' };
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
): Promise<MutationResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = '/api/shop-items';
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
        logAction(
            'createShopItemAction',
            'POST',
            buildBackendUrl(endpoint),
            res.status,
        );
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '登録に失敗しました',
            };
        }
        const body = (await res.json()) as { item: ShopItemData };
        revalidateShopPage(eventId);
        return { success: true, data: body.item };
    } catch (err) {
        logActionError(
            'createShopItemAction',
            'POST',
            buildBackendUrl(endpoint),
            err,
        );
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
): Promise<MutationResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = `/api/shop-items/${id}`;
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
        logAction(
            'updateShopItemAction',
            'PUT',
            buildBackendUrl(endpoint),
            res.status,
        );
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '更新に失敗しました',
            };
        }
        const body = (await res.json()) as { item: ShopItemData };
        revalidateShopPage(eventId);
        return { success: true, data: body.item };
    } catch (err) {
        logActionError(
            'updateShopItemAction',
            'PUT',
            buildBackendUrl(endpoint),
            err,
        );
        return { success: false, error: '更新に失敗しました' };
    }
}

export async function deleteShopItemAction(
    eventId: string,
    id: string,
): Promise<ActionResult> {
    const authToken = await getAuthToken();
    if (!authToken) return { success: false, error: '認証が必要です' };

    const endpoint = `/api/shop-items/${id}`;
    try {
        const res = await fetchFromBackend(endpoint, {
            method: 'DELETE',
            headers: {
                Cookie: `auth_token=${authToken}`,
                'x-event-id': eventId,
            },
        });
        logAction(
            'deleteShopItemAction',
            'DELETE',
            buildBackendUrl(endpoint),
            res.status,
        );
        if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            return {
                success: false,
                error: body.error ?? '削除に失敗しました',
            };
        }
        revalidateShopPage(eventId);
        return { success: true };
    } catch (err) {
        logActionError(
            'deleteShopItemAction',
            'DELETE',
            buildBackendUrl(endpoint),
            err,
        );
        return { success: false, error: '削除に失敗しました' };
    }
}
