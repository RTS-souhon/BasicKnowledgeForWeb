import type { Env } from '@backend/src/db/connection';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import {
    createRoomSchema,
    updateRoomSchema,
} from '@backend/src/infrastructure/validators/roomValidator';
import type { ICreateRoomUseCase } from '@backend/src/use-cases/room/ICreateRoomUseCase';
import type { IDeleteRoomUseCase } from '@backend/src/use-cases/room/IDeleteRoomUseCase';
import type { IGetRoomsUseCase } from '@backend/src/use-cases/room/IGetRoomsUseCase';
import type { IUpdateRoomUseCase } from '@backend/src/use-cases/room/IUpdateRoomUseCase';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

export async function getRooms(c: Context, useCase: IGetRoomsUseCase) {
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
    return c.json({ rooms: result.data }, 200);
}

const idSchema = z.string().uuid();
const toStatus = (code?: number): ContentfulStatusCode =>
    (code ?? 500) as ContentfulStatusCode;

type AdminContext = Context<{
    Bindings: Env;
    Variables: ContentEditVariables;
}>;

export async function createRoom(c: AdminContext, useCase: ICreateRoomUseCase) {
    const body = await c.req.json().catch(() => null);
    const parsed = createRoomSchema.safeParse(body);
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
        buildingName: parsed.data.building_name,
        floor: parsed.data.floor,
        roomName: parsed.data.room_name,
        preDayManagerId: parsed.data.pre_day_manager_id ?? null,
        preDayPurpose: parsed.data.pre_day_purpose ?? null,
        dayManagerId: parsed.data.day_manager_id,
        dayPurpose: parsed.data.day_purpose,
        notes: parsed.data.notes ?? null,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ room: result.data }, 201);
}

export async function updateRoom(c: AdminContext, useCase: IUpdateRoomUseCase) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateRoomSchema.safeParse(body);
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
            buildingName: parsed.data.building_name,
            floor: parsed.data.floor,
            roomName: parsed.data.room_name,
            preDayManagerId: parsed.data.pre_day_manager_id,
            preDayPurpose: parsed.data.pre_day_purpose,
            dayManagerId: parsed.data.day_manager_id,
            dayPurpose: parsed.data.day_purpose,
            notes: parsed.data.notes,
        },
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ room: result.data }, 200);
}

export async function deleteRoom(c: AdminContext, useCase: IDeleteRoomUseCase) {
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
