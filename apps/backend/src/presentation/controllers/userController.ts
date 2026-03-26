import type { Context } from 'hono';
import { createUserSchema } from '@/infrastructure/validators/userValidator';
import type { ICreateUserUseCase } from '@/use-cases/user/ICreateUserUseCase';
import type { IGetUsersUseCase } from '@/use-cases/user/IGetUsersUseCase';

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
