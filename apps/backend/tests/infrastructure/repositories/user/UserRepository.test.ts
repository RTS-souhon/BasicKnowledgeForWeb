import { describe, expect, it, jest } from '@jest/globals';
import type { createDatabaseClient } from '@backend/src/db/connection';
import type { User } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { UserRepository } from '@backend/src/infrastructure/repositories/user/UserRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

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

describe('UserRepository', () => {
    describe('findAll', () => {
        it('全ユーザーを返す', async () => {
            const fromMock = jest
                .fn()
                .mockImplementation(() => Promise.resolve([mockUser]));
            const db = {
                select: jest.fn().mockReturnValue({ from: fromMock }),
            } as unknown as DatabaseClient;
            const repository = new UserRepository(db);

            const result = await repository.findAll();

            expect(result).toEqual([mockUser]);
            expect(db.select).toHaveBeenCalledTimes(1);
        });

        it('ユーザーが存在しない場合、空配列を返す', async () => {
            const db = {
                select: jest.fn().mockReturnValue({
                    from: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve([])),
                }),
            } as unknown as DatabaseClient;
            const repository = new UserRepository(db);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findByEmail', () => {
        it('メールアドレスが一致するユーザーを返す', async () => {
            const limitMock = jest
                .fn()
                .mockImplementation(() => Promise.resolve([mockUser]));
            const db = {
                select: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({ limit: limitMock }),
                    }),
                }),
            } as unknown as DatabaseClient;
            const repository = new UserRepository(db);

            const result = await repository.findByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(limitMock).toHaveBeenCalledWith(1);
        });

        it('ユーザーが存在しない場合、nullを返す', async () => {
            const db = {
                select: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            limit: jest
                                .fn()
                                .mockImplementation(() => Promise.resolve([])),
                        }),
                    }),
                }),
            } as unknown as DatabaseClient;
            const repository = new UserRepository(db);

            const result = await repository.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('ユーザーを作成して返す', async () => {
            const valuesMock = jest.fn().mockReturnValue({
                returning: jest
                    .fn()
                    .mockImplementation(() => Promise.resolve([mockUser])),
            });
            const db = {
                insert: jest.fn().mockReturnValue({ values: valuesMock }),
            } as unknown as DatabaseClient;
            const repository = new UserRepository(db);

            const input = {
                name: 'テストユーザー',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
            };
            const result = await repository.create(input);

            expect(result).toEqual(mockUser);
            expect(valuesMock).toHaveBeenCalledWith(input);
        });
    });
});
