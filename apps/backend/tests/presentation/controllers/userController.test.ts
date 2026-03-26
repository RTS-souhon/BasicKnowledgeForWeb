import { Hono } from 'hono';
import { describe, expect, it } from '@jest/globals';
import { createUser, getUsers } from '@/presentation/controllers/userController';
import type { User } from '@/infrastructure/repositories/user/IUserRepository';
import type { ICreateUserUseCase } from '@/use-cases/user/ICreateUserUseCase';
import type { IGetUsersUseCase } from '@/use-cases/user/IGetUsersUseCase';

const mockUser: User = {
    id: 'uuid-1',
    name: 'テストユーザー',
    email: 'test@example.com',
    password: 'hashed',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
};

// ---- getUsers ----

describe('getUsers controller', () => {
    it('ユーザー一覧を200で返す', async () => {
        const mockUseCase: IGetUsersUseCase = {
            execute: async () => ({ success: true, data: [mockUser] }),
        };
        const app = new Hono();
        app.get('/users', (c) => getUsers(c, mockUseCase));

        const res = await app.request('/users');

        expect(res.status).toBe(200);
        const json = await res.json() as { users: User[] };
        expect(json.users).toHaveLength(1);
        expect(json.users[0].email).toBe('test@example.com');
    });

    it('UseCase失敗時に500を返す', async () => {
        const mockUseCase: IGetUsersUseCase = {
            execute: async () => ({ success: false, error: 'DB Error' }),
        };
        const app = new Hono();
        app.get('/users', (c) => getUsers(c, mockUseCase));

        const res = await app.request('/users');

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'DB Error' });
    });
});

// ---- createUser ----

describe('createUser controller', () => {
    const validBody = {
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'password123',
    };

    function postJson(app: Hono, body: unknown) {
        return app.request('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    it('ユーザー作成成功時に201を返す', async () => {
        const mockUseCase: ICreateUserUseCase = {
            execute: async () => ({ success: true, data: mockUser }),
        };
        const app = new Hono();
        app.post('/users', (c) => createUser(c, mockUseCase));

        const res = await postJson(app, validBody);

        expect(res.status).toBe(201);
        const json = await res.json() as { user: User };
        expect(json.user.email).toBe('test@example.com');
    });

    it('バリデーションエラー時に400を返す', async () => {
        const mockUseCase: ICreateUserUseCase = {
            execute: async () => ({ success: true, data: mockUser }),
        };
        const app = new Hono();
        app.post('/users', (c) => createUser(c, mockUseCase));

        const res = await postJson(app, { name: '', email: 'invalid', password: 'short' });

        expect(res.status).toBe(400);
        const json = await res.json() as { error: string };
        expect(json.error).toBe('バリデーションエラー');
    });

    it('UseCase失敗時（メール重複など）に400を返す', async () => {
        const mockUseCase: ICreateUserUseCase = {
            execute: async () => ({
                success: false,
                error: 'このメールアドレスは既に使用されています',
            }),
        };
        const app = new Hono();
        app.post('/users', (c) => createUser(c, mockUseCase));

        const res = await postJson(app, validBody);

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({
            error: 'このメールアドレスは既に使用されています',
        });
    });
});
