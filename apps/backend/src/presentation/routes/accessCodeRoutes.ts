import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import { AccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/AccessCodeRepository';
import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import {
    createAccessCode,
    deleteAccessCode,
    getAccessCodes,
    verifyAccessCode,
} from '@backend/src/presentation/controllers/accessCodeController';
import { CreateAccessCodeUseCase } from '@backend/src/use-cases/access-code/CreateAccessCodeUseCase';
import { DeleteAccessCodeUseCase } from '@backend/src/use-cases/access-code/DeleteAccessCodeUseCase';
import { GetAccessCodesUseCase } from '@backend/src/use-cases/access-code/GetAccessCodesUseCase';
import { VerifyAccessCodeUseCase } from '@backend/src/use-cases/access-code/VerifyAccessCodeUseCase';
import { Hono } from 'hono';
import {
    type AuthVariables,
    authMiddleware,
} from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

type AccessCodeRepositoryFactory = (env: Env) => IAccessCodeRepository;

const ADMIN_ROLES = ['admin', 'developer'];

export function createAccessCodeRoutes(
    repositoryFactory: AccessCodeRepositoryFactory = (env) =>
        new AccessCodeRepository(createDatabaseClient(env)),
) {
    return (
        new Hono<{ Bindings: Env; Variables: AuthVariables }>()
            // POST /api/access-codes/verify — 誰でも可
            .post('/access-codes/verify', async (c) => {
                const repository = repositoryFactory(c.env);
                const useCase = new VerifyAccessCodeUseCase(repository);
                return verifyAccessCode(c, useCase);
            })
            // GET /api/access-codes — admin/developer のみ
            .get(
                '/access-codes',
                authMiddleware,
                roleGuard(ADMIN_ROLES),
                async (c) => {
                    const repository = repositoryFactory(c.env);
                    const useCase = new GetAccessCodesUseCase(repository);
                    return getAccessCodes(c, useCase);
                },
            )
            // POST /api/access-codes — admin/developer のみ
            .post(
                '/access-codes',
                authMiddleware,
                roleGuard(ADMIN_ROLES),
                async (c) => {
                    const repository = repositoryFactory(c.env);
                    const useCase = new CreateAccessCodeUseCase(repository);
                    return createAccessCode(c, useCase);
                },
            )
            // DELETE /api/access-codes/:id — admin/developer のみ
            .delete(
                '/access-codes/:id',
                authMiddleware,
                roleGuard(ADMIN_ROLES),
                async (c) => {
                    const repository = repositoryFactory(c.env);
                    const useCase = new DeleteAccessCodeUseCase(repository);
                    return deleteAccessCode(c, useCase);
                },
            )
    );
}
