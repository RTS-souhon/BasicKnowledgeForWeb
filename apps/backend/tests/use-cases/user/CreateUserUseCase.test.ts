import { describe, expect, it } from '@jest/globals';
import type { IUserRepository, NewUser, User } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { CreateUserUseCase } from '@backend/src/use-cases/user/CreateUserUseCase';

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

const validInput = {
    name: 'テストユーザー',
    email: 'test@example.com',
    password: 'password123',
    role: 'user' as const,
};

function createMockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
    return {
        findAll: async () => [],
        findById: async () => null,
        findByEmail: async () => null,
        create: async () => mockUser,
        updateRole: async () => null,
        ...overrides,
    };
}

describe('CreateUserUseCase', () => {
    it('正常にユーザーを作成できる', async () => {
        const repo = createMockRepo();
        const useCase = new CreateUserUseCase(repo);

        const result = await useCase.execute(validInput);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data).toEqual(mockUser);
    });

    it('パスワードをハッシュ化してリポジトリに渡す', async () => {
        let capturedInput: NewUser | undefined;
        const repo = createMockRepo({
            create: async (input) => {
                capturedInput = input;
                return { ...mockUser, ...input };
            },
        });
        const useCase = new CreateUserUseCase(repo);

        await useCase.execute(validInput);

        expect(capturedInput?.password).not.toBe(validInput.password);
        expect(capturedInput?.password.startsWith('$2')).toBe(true); // bcryptハッシュ
    });

    it('メールアドレスが既に使用されている場合はエラーを返す', async () => {
        const repo = createMockRepo({ findByEmail: async () => mockUser });
        const useCase = new CreateUserUseCase(repo);

        const result = await useCase.execute(validInput);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toBe('このメールアドレスは既に使用されています');
    });

    it('roleを省略した場合はデフォルト値userが使われる', async () => {
        let capturedInput: NewUser | undefined;
        const repo = createMockRepo({
            create: async (input) => {
                capturedInput = input;
                return { ...mockUser, ...input };
            },
        });
        const useCase = new CreateUserUseCase(repo);

        await useCase.execute({ ...validInput, role: undefined as unknown as string });

        expect(capturedInput?.role).toBe('user');
    });

    it('DBエラー時にsuccess: falseとエラーメッセージを返す', async () => {
        const repo = createMockRepo({
            create: async () => {
                throw new Error('INSERT失敗');
            },
        });
        const useCase = new CreateUserUseCase(repo);

        const result = await useCase.execute(validInput);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error).toBe('INSERT失敗');
    });
});
