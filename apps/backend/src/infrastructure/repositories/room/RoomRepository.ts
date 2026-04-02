import type { createDatabaseClient } from '@backend/src/db/connection';
import { rooms } from '@backend/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { IRoomRepository, Room } from './IRoomRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export class RoomRepository implements IRoomRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<Room[]> {
        return this.db
            .select()
            .from(rooms)
            .where(eq(rooms.eventId, eventId))
            .orderBy(
                asc(rooms.buildingName),
                asc(rooms.floor),
                asc(rooms.roomName),
            );
    }
}
