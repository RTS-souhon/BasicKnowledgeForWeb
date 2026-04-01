import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { UserRepository } from '@backend/src/infrastructure/repositories/user/UserRepository';
import {
    createUser,
    getUsers,
} from '@backend/src/presentation/controllers/userController';
import { CreateUserUseCase } from '@backend/src/use-cases/user/CreateUserUseCase';
import { GetUsersUseCase } from '@backend/src/use-cases/user/GetUsersUseCase';
import { Hono } from 'hono';

type UserRepositoryFactory = (env: Env) => IUserRepository;

export function createUserRoutes(
    repositoryFactory: UserRepositoryFactory = (env) =>
        new UserRepository(createDatabaseClient(env)),
) {
    return (
        new Hono<{ Bindings: Env }>()
            // GET /api/users - ユーザー一覧取得
            .get('/users', async (c) => {
                const repository = repositoryFactory(c.env);
                const useCase = new GetUsersUseCase(repository);
                return getUsers(c, useCase);
            })
            // POST /api/users - ユーザー作成
            .post('/users', async (c) => {
                const repository = repositoryFactory(c.env);
                const useCase = new CreateUserUseCase(repository);
                return createUser(c, useCase);
            })
    );
}
