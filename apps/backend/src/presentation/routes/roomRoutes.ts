import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import type { IRoomRepository } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import { RoomRepository } from '@backend/src/infrastructure/repositories/room/RoomRepository';
import { getRooms } from '@backend/src/presentation/controllers/roomController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { GetRoomsUseCase } from '@backend/src/use-cases/room/GetRoomsUseCase';
import { Hono } from 'hono';

type RoomRepositoryFactory = (env: Env) => IRoomRepository;

export function createRoomRoutes(
    repositoryFactory: RoomRepositoryFactory = (env) =>
        new RoomRepository(createDatabaseClient(env)),
) {
    return new Hono<{ Bindings: Env }>().get(
        '/rooms',
        contentAccessMiddleware,
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new GetRoomsUseCase(repository);
            return getRooms(c, useCase);
        },
    );
}
