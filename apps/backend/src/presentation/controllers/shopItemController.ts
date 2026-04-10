import type { Env } from '@backend/src/db/connection';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import {
    createShopItemSchema,
    createShopItemUploadUrlSchema,
    updateShopItemSchema,
} from '@backend/src/infrastructure/validators/shopItemValidator';
import type { ICreateShopItemUseCase } from '@backend/src/use-cases/shop-item/ICreateShopItemUseCase';
import type { IDeleteShopItemUseCase } from '@backend/src/use-cases/shop-item/IDeleteShopItemUseCase';
import type { IGenerateShopItemUploadUrlUseCase } from '@backend/src/use-cases/shop-item/IGenerateShopItemUploadUrlUseCase';
import type { IGetShopItemsUseCase } from '@backend/src/use-cases/shop-item/IGetShopItemsUseCase';
import type { IUpdateShopItemUseCase } from '@backend/src/use-cases/shop-item/IUpdateShopItemUseCase';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

export async function getShopItems(c: Context, useCase: IGetShopItemsUseCase) {
    const parsed = eventIdHeaderSchema.safeParse(c.req.header());
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute(parsed.data['x-event-id']);
    if (!result.success) {
        return c.json({ error: result.error }, 500);
    }
    return c.json({ items: result.data }, 200);
}

const idSchema = z.string().uuid();
const toStatus = (code?: number): ContentfulStatusCode =>
    (code ?? 500) as ContentfulStatusCode;

type AdminContext = Context<{
    Bindings: Env;
    Variables: ContentEditVariables;
}>;

export async function createShopItem(
    c: AdminContext,
    useCase: ICreateShopItemUseCase,
) {
    const body = await c.req.json().catch(() => null);
    const parsed = createShopItemSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const eventId = c.get('eventId');
    if (parsed.data.event_id !== eventId) {
        return c.json({ error: 'event_id が一致しません' }, 400);
    }

    const result = await useCase.execute({
        eventId,
        name: parsed.data.name,
        price: parsed.data.price,
        stockStatus: parsed.data.stock_status,
        description: parsed.data.description ?? null,
        imageKey: parsed.data.image_key,
        imageUrl: parsed.data.image_url,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ item: result.data }, 201);
}

export async function updateShopItem(
    c: AdminContext,
    useCase: IUpdateShopItemUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateShopItemSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute({
        id: idParsed.data,
        eventId: c.get('eventId'),
        payload: {
            name: parsed.data.name,
            price: parsed.data.price,
            stockStatus: parsed.data.stock_status,
            description: parsed.data.description,
            imageKey: parsed.data.image_key,
            imageUrl: parsed.data.image_url,
        },
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ item: result.data }, 200);
}

export async function deleteShopItem(
    c: AdminContext,
    useCase: IDeleteShopItemUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute({
        id: idParsed.data,
        eventId: c.get('eventId'),
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ id: result.data.id }, 200);
}

export async function createShopItemUploadUrl(
    c: AdminContext,
    useCase: IGenerateShopItemUploadUrlUseCase,
) {
    const body = await c.req.json().catch(() => ({}));
    const parsed = createShopItemUploadUrlSchema.safeParse(body ?? {});
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute({
        eventId: c.get('eventId'),
        fileName: parsed.data.file_name,
        contentType: parsed.data.content_type,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json(result.data, 200);
}
