import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type {
    IUserRepository,
    User,
} from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { hash } from 'bcryptjs';
import { sign } from 'hono/jwt';
import { createTestAppWithAuth } from '../helpers/createTestApp';

const JWT_SECRET = 'test-secret';
// c.env.JWT_SECRET だけを使うルートのため HYPERDRIVE は省略して cast する
const mockEnv = { JWT_SECRET } as unknown as Env;

let testUser: User;

beforeAll(async () => {
    // salt rounds=1 でハッシュ化することでテスト実行を高速化する
    const hashedPassword = await hash('password123', 1);
    testUser = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'テストユーザー',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
    };
});

function createMockUserRepository(
    overrides: Partial<IUserRepository> = {},
): IUserRepository {
    return {
        findAll: jest.fn<() => Promise<User[]>>().mockResolvedValue([]),
        findByEmail: jest
            .fn<(email: string) => Promise<User | null>>()
            .mockResolvedValue(null),
        create: jest
            .fn<() => Promise<User>>()
            .mockImplementation(() => Promise.resolve(testUser)),
        ...overrides,
    };
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
    it('正常なログインで 200 と Set-Cookie が返ること', async () => {
        const repo = createMockUserRepository({
            findByEmail: jest
                .fn<(email: string) => Promise<User | null>>()
                .mockImplementation(() => Promise.resolve(testUser)),
        });
        const app = createTestAppWithAuth(repo);

        const res = await app.request(
            '/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123',
                }),
            },
            mockEnv,
        );

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toContain('auth_token=');
    });

    it('パスワードが不一致の場合 401 が返ること', async () => {
        const repo = createMockUserRepository({
            findByEmail: jest
                .fn<(email: string) => Promise<User | null>>()
                .mockImplementation(() => Promise.resolve(testUser)),
        });
        const app = createTestAppWithAuth(repo);

        const res = await app.request(
            '/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                }),
            },
            mockEnv,
        );

        expect(res.status).toBe(401);
    });

    it('ユーザーが存在しない場合 401 が返ること', async () => {
        const repo = createMockUserRepository({
            findByEmail: jest
                .fn<(email: string) => Promise<User | null>>()
                .mockResolvedValue(null),
        });
        const app = createTestAppWithAuth(repo);

        const res = await app.request(
            '/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'notexist@example.com',
                    password: 'password123',
                }),
            },
            mockEnv,
        );

        expect(res.status).toBe(401);
    });

    it('バリデーションエラー（無効なメールアドレス）で 400 が返ること', async () => {
        const app = createTestAppWithAuth(createMockUserRepository());

        const res = await app.request(
            '/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: 'password123',
                }),
            },
            mockEnv,
        );
        const body = (await res.json()) as { error: string };

        expect(res.status).toBe(400);
        expect(body.error).toBe('バリデーションエラー');
    });

    it('バリデーションエラー（リクエストボディなし）で 400 が返ること', async () => {
        const app = createTestAppWithAuth(createMockUserRepository());

        const res = await app.request(
            '/api/auth/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            },
            mockEnv,
        );

        expect(res.status).toBe(400);
    });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
    it('200 が返ること', async () => {
        const app = createTestAppWithAuth(createMockUserRepository());

        const res = await app.request(
            '/api/auth/logout',
            { method: 'POST' },
            mockEnv,
        );

        expect(res.status).toBe(200);
    });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
    it('有効な auth_token Cookie で 200 とユーザー情報が返ること', async () => {
        const token = await sign(
            {
                id: testUser.id,
                name: testUser.name,
                email: testUser.email,
                role: testUser.role,
                exp: Math.floor(Date.now() / 1000) + 3600,
            },
            JWT_SECRET,
            'HS256',
        );

        const app = createTestAppWithAuth(createMockUserRepository());
        const res = await app.request(
            '/api/auth/me',
            { headers: { Cookie: `auth_token=${token}` } },
            mockEnv,
        );
        const body = (await res.json()) as { role: string; email: string };

        expect(res.status).toBe(200);
        expect(body.role).toBe('admin');
        expect(body.email).toBe('test@example.com');
    });

    it('Cookie なしで 401 が返ること', async () => {
        const app = createTestAppWithAuth(createMockUserRepository());
        const res = await app.request('/api/auth/me', {}, mockEnv);

        expect(res.status).toBe(401);
    });

    it('不正な auth_token で 401 が返ること', async () => {
        const app = createTestAppWithAuth(createMockUserRepository());
        const res = await app.request(
            '/api/auth/me',
            { headers: { Cookie: 'auth_token=invalid.token.value' } },
            mockEnv,
        );

        expect(res.status).toBe(401);
    });
});
