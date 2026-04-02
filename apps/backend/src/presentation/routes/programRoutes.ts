import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import { ProgramRepository } from '@backend/src/infrastructure/repositories/program/ProgramRepository';
import { getPrograms } from '@backend/src/presentation/controllers/programController';
import { GetProgramsUseCase } from '@backend/src/use-cases/program/GetProgramsUseCase';
import { Hono } from 'hono';

type ProgramRepositoryFactory = (env: Env) => IProgramRepository;

export function createProgramRoutes(
    repositoryFactory: ProgramRepositoryFactory = (env) =>
        new ProgramRepository(createDatabaseClient(env)),
) {
    return new Hono<{ Bindings: Env }>().get('/programs', async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new GetProgramsUseCase(repository);
        return getPrograms(c, useCase);
    });
}
