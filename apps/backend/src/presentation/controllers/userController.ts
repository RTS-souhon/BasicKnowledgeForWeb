import { updateUserRoleSchema } from '@backend/src/infrastructure/validators/userRoleValidator';
import { createUserSchema } from '@backend/src/infrastructure/validators/userValidator';
import type { ICreateUserUseCase } from '@backend/src/use-cases/user/ICreateUserUseCase';
import type { IGetUsersUseCase } from '@backend/src/use-cases/user/IGetUsersUseCase';
import type { IUpdateUserRoleUseCase } from '@backend/src/use-cases/user/IUpdateUserRoleUseCase';
import type { Context } from 'hono';
import { z } from 'zod';

export async function getUsers(c: Context, useCase: IGetUsersUseCase) {
    try {
        const result = await useCase.execute();

        if (!result.success) {
            return c.json({ error: result.error }, 500);
        }

        return c.json({ users: result.data });
    } catch {
        return c.json({ error: 'ユーザーの取得に失敗しました' }, 500);
    }
}

const idSchema = z.string().uuid();

export async function updateUserRole(
    c: Context,
    useCase: IUpdateUserRoleUseCase,
) {
    const idParsed = idSchema.safeParse(c.req.param('id') ?? '');
    if (!idParsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: idParsed.error.issues },
            400,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateUserRoleSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute({
        id: idParsed.data,
        role: parsed.data.role,
    });
    if (!result.success) {
        return c.json({ error: result.error }, result.status as 404 | 500);
    }
    return c.json({ message: 'ロールを変更しました' }, 200);
}

export async function createUser(c: Context, useCase: ICreateUserUseCase) {
    try {
        const body = await c.req.json();
        const validation = createUserSchema.safeParse(body);

        if (!validation.success) {
            return c.json(
                {
                    error: 'バリデーションエラー',
                    details: validation.error.issues,
                },
                400,
            );
        }

        const result = await useCase.execute(validation.data);

        if (!result.success) {
            return c.json({ error: result.error }, 400);
        }

        return c.json({ user: result.data }, 201);
    } catch {
        return c.json({ error: 'ユーザーの作成に失敗しました' }, 500);
    }
}
