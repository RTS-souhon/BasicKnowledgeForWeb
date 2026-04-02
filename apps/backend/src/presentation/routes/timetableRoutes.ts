import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { ITimetableRepository } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import { TimetableRepository } from '@backend/src/infrastructure/repositories/timetable/TimetableRepository';
import { getTimetableItems } from '@backend/src/presentation/controllers/timetableController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { GetTimetableItemsUseCase } from '@backend/src/use-cases/timetable/GetTimetableItemsUseCase';
import { Hono } from 'hono';

type TimetableRepositoryFactory = (env: Env) => ITimetableRepository;

export function createTimetableRoutes(
    repositoryFactory: TimetableRepositoryFactory = (env) =>
        new TimetableRepository(createDatabaseClient(env)),
) {
    return new Hono<{ Bindings: Env }>().get(
        '/timetable',
        contentAccessMiddleware,
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new GetTimetableItemsUseCase(repository);
            return getTimetableItems(c, useCase);
        },
    );
}
