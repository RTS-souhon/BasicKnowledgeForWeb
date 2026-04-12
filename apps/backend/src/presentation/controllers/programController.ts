import type { Env } from '@backend/src/db/connection';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import {
    createProgramSchema,
    updateProgramSchema,
} from '@backend/src/infrastructure/validators/programValidator';
import type { ICreateProgramUseCase } from '@backend/src/use-cases/program/ICreateProgramUseCase';
import type { IDeleteProgramUseCase } from '@backend/src/use-cases/program/IDeleteProgramUseCase';
import type { IGetProgramsUseCase } from '@backend/src/use-cases/program/IGetProgramsUseCase';
import type { IUpdateProgramUseCase } from '@backend/src/use-cases/program/IUpdateProgramUseCase';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

export async function getPrograms(c: Context, useCase: IGetProgramsUseCase) {
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
    return c.json({ programs: result.data }, 200);
}

const idSchema = z.string().uuid();
const toStatus = (code?: number): ContentfulStatusCode =>
    (code ?? 500) as ContentfulStatusCode;

type AdminContext = Context<{
    Bindings: Env;
    Variables: ContentEditVariables;
}>;

export async function createProgram(
    c: AdminContext,
    useCase: ICreateProgramUseCase,
) {
    const body = await c.req.json().catch(() => null);
    const parsed = createProgramSchema.safeParse(body);
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
        location: parsed.data.location,
        startTime: parsed.data.start_time,
        endTime: parsed.data.end_time,
        description: parsed.data.description ?? null,
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ program: result.data }, 201);
}

export async function updateProgram(
    c: AdminContext,
    useCase: IUpdateProgramUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateProgramSchema.safeParse(body);
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
            location: parsed.data.location,
            startTime: parsed.data.start_time,
            endTime: parsed.data.end_time,
            description: parsed.data.description,
        },
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ program: result.data }, 200);
}

export async function deleteProgram(
    c: AdminContext,
    useCase: IDeleteProgramUseCase,
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
