import { Hono } from 'hono';
import { createDatabaseClient, type Env } from '@/db/connection';
import type { IUserRepository } from '@/infrastructure/repositories/user/IUserRepository';
import { UserRepository } from '@/infrastructure/repositories/user/UserRepository';
import {
    createUser,
    getUsers,
} from '@/presentation/controllers/userController';
import { CreateUserUseCase } from '@/use-cases/user/CreateUserUseCase';
import { GetUsersUseCase } from '@/use-cases/user/GetUsersUseCase';

type UserRepositoryFactory = (env: Env) => IUserRepository;

export function createUserRoutes(
    repositoryFactory: UserRepositoryFactory = (env) =>
        new UserRepository(createDatabaseClient(env)),
) {
    const app = new Hono<{ Bindings: Env }>();

    // GET /api/users - ユーザー一覧取得
    app.get('/users', async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new GetUsersUseCase(repository);
        return getUsers(c, useCase);
    });

    // POST /api/users - ユーザー作成
    app.post('/users', async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new CreateUserUseCase(repository);
        return createUser(c, useCase);
    });

    return app;
}
