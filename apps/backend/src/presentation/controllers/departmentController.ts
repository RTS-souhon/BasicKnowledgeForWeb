import type { Env } from '@backend/src/db/connection';
import {
    createDepartmentSchema,
    updateDepartmentSchema,
} from '@backend/src/infrastructure/validators/departmentValidator';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import type { ICreateDepartmentUseCase } from '@backend/src/use-cases/department/ICreateDepartmentUseCase';
import type { IDeleteDepartmentUseCase } from '@backend/src/use-cases/department/IDeleteDepartmentUseCase';
import type { IGetDepartmentsUseCase } from '@backend/src/use-cases/department/IGetDepartmentsUseCase';
import type { IUpdateDepartmentUseCase } from '@backend/src/use-cases/department/IUpdateDepartmentUseCase';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

export async function getDepartments(
    c: Context,
    useCase: IGetDepartmentsUseCase,
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
    return c.json({ departments: result.data }, 200);
}

const idSchema = z.string().uuid();
const toStatus = (code?: number): ContentfulStatusCode =>
    (code ?? 500) as ContentfulStatusCode;

type AdminContext = Context<{
    Bindings: Env;
    Variables: ContentEditVariables;
}>;

export async function createDepartment(
    c: AdminContext,
    useCase: ICreateDepartmentUseCase,
) {
    const body = await c.req.json().catch(() => null);
    const parsed = createDepartmentSchema.safeParse(body);
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
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ department: result.data }, 201);
}

export async function updateDepartment(
    c: AdminContext,
    useCase: IUpdateDepartmentUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateDepartmentSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute({
        id: idParsed.data,
        eventId: c.get('eventId'),
        payload: { name: parsed.data.name },
    });
    if (!result.success) {
        return c.json({ error: result.error }, toStatus(result.status));
    }
    return c.json({ department: result.data }, 200);
}

export async function deleteDepartment(
    c: AdminContext,
    useCase: IDeleteDepartmentUseCase,
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
