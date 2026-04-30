import type { Env } from '@backend/src/db/connection';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import {
    createOtherItemSchema,
    updateOtherItemSchema,
} from '@backend/src/infrastructure/validators/otherItemValidator';
import type { ICreateOtherItemUseCase } from '@backend/src/use-cases/other-item/ICreateOtherItemUseCase';
import type { IDeleteOtherItemUseCase } from '@backend/src/use-cases/other-item/IDeleteOtherItemUseCase';
import type { IGetOtherItemsUseCase } from '@backend/src/use-cases/other-item/IGetOtherItemsUseCase';
import type { IUpdateOtherItemUseCase } from '@backend/src/use-cases/other-item/IUpdateOtherItemUseCase';
import type { IUploadOtherItemImageUseCase } from '@backend/src/use-cases/other-item/IUploadOtherItemImageUseCase';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

export async function getOtherItems(
    c: Context,
    useCase: IGetOtherItemsUseCase,
) {
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
    c.header('Cache-Control', 'no-store, max-age=0, must-revalidate');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    return c.json({ items: result.data }, 200);
}

const idSchema = z.string().uuid();
const toStatus = (code?: number): ContentfulStatusCode =>
    (code ?? 500) as ContentfulStatusCode;

type AdminContext = Context<{
    Bindings: Env;
    Variables: ContentEditVariables;
}>;

export async function createOtherItem(
    c: AdminContext,
    useCase: ICreateOtherItemUseCase,
) {
    const body = await c.req.json().catch(() => null);
    const parsed = createOtherItemSchema.safeParse(body);
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

    const user = c.get('user');
    const input = {
        eventId,
        title: parsed.data.title,
        content: parsed.data.content,
        displayOrder: parsed.data.display_order,
        createdBy: user.id,
        ...(parsed.data.image_key !== undefined
            ? { imageKey: parsed.data.image_key }
            : {}),
    };

    const result = await useCase.execute(input);
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ item: result.data }, 201);
}

export async function updateOtherItem(
    c: AdminContext,
    useCase: IUpdateOtherItemUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateOtherItemSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const payload = {
        title: parsed.data.title,
        content: parsed.data.content,
        displayOrder: parsed.data.display_order,
        ...(parsed.data.image_key !== undefined
            ? { imageKey: parsed.data.image_key }
            : {}),
    };

    const result = await useCase.execute({
        id: idParsed.data,
        eventId: c.get('eventId'),
        payload,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ item: result.data }, 200);
}

export async function deleteOtherItem(
    c: AdminContext,
    useCase: IDeleteOtherItemUseCase,
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

export async function uploadOtherItemImage(
    c: AdminContext,
    useCase: IUploadOtherItemImageUseCase,
) {
    let formData: FormData;
    try {
        formData = await c.req.formData();
    } catch {
        return c.json({ error: 'フォームデータの解析に失敗しました' }, 400);
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
        return c.json({ error: 'file フィールドが必要です' }, 400);
    }

    const body = await file.arrayBuffer();
    const result = await useCase.execute({
        eventId: c.get('eventId'),
        body,
        contentType: file.type || 'application/octet-stream',
        fileName: file.name,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json(result.data, 200);
}
