import { describe, expect, it, jest } from '@jest/globals';
import type {
    IUserRepository,
    User,
} from '@/infrastructure/repositories/user/IUserRepository';
import { createTestAppWithUsers } from '../helpers/createTestApp';

const mockUser: User = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'テストユーザー',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
};

function createMockUserRepository(
    overrides: Partial<IUserRepository> = {},
): IUserRepository {
    return {
        findAll: jest.fn<() => Promise<User[]>>().mockResolvedValue([]),
        findByEmail: jest
            .fn<(email: string) => Promise<User | null>>()
            .mockResolvedValue(null),
        create: jest.fn<() => Promise<User>>().mockResolvedValue(mockUser),
        ...overrides,
    };
}

describe('GET /api/users', () => {
    it('ユーザー一覧を返す', async () => {
        const repository = createMockUserRepository({
            findAll: jest
                .fn<() => Promise<User[]>>()
                .mockResolvedValue([mockUser]),
        });
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users');
        const body = await res.json() as { users: User[] };

        expect(res.status).toBe(200);
        expect(body.users).toHaveLength(1);
        expect(body.users[0].email).toBe('test@example.com');
    });

    it('ユーザーが存在しない場合、空配列を返す', async () => {
        const repository = createMockUserRepository();
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users');
        const body = await res.json() as { users: User[] };

        expect(res.status).toBe(200);
        expect(body.users).toEqual([]);
    });

    it('リポジトリがエラーをスローした場合、500を返す', async () => {
        const repository = createMockUserRepository({
            findAll: jest
                .fn<() => Promise<User[]>>()
                .mockRejectedValue(new Error('DB error')),
        });
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users');

        expect(res.status).toBe(500);
    });
});

describe('POST /api/users', () => {
    const validUserBody = {
        name: '新規ユーザー',
        email: 'new@example.com',
        password: 'password123',
    };

    it('正常なデータでユーザーを作成し、201を返す', async () => {
        const createdUser: User = {
            ...mockUser,
            name: '新規ユーザー',
            email: 'new@example.com',
        };
        const repository = createMockUserRepository({
            findByEmail: jest
                .fn<(email: string) => Promise<User | null>>()
                .mockResolvedValue(null),
            create: jest
                .fn<() => Promise<User>>()
                .mockResolvedValue(createdUser),
        });
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validUserBody),
        });
        const body = await res.json() as { user: Omit<User, 'password'> };

        expect(res.status).toBe(201);
        expect(body.user.email).toBe('new@example.com');
    });

    it('メールアドレスが既に存在する場合、400を返す', async () => {
        const repository = createMockUserRepository({
            findByEmail: jest
                .fn<(email: string) => Promise<User | null>>()
                .mockResolvedValue(mockUser),
        });
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validUserBody),
        });

        expect(res.status).toBe(400);
    });

    it('バリデーションエラー（メールアドレス不正）の場合、400を返す', async () => {
        const repository = createMockUserRepository();
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validUserBody, email: 'invalid-email' }),
        });
        const body = await res.json() as { error: string };

        expect(res.status).toBe(400);
        expect(body.error).toBe('バリデーションエラー');
    });

    it('バリデーションエラー（パスワード短すぎ）の場合、400を返す', async () => {
        const repository = createMockUserRepository();
        const app = createTestAppWithUsers(repository);

        const res = await app.request('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validUserBody, password: 'short' }),
        });

        expect(res.status).toBe(400);
    });
});
