import type { rooms } from '@backend/src/db/schema';

export type Room = typeof rooms.$inferSelect;

export interface IRoomRepository {
    findByEventId(eventId: string): Promise<Room[]>;
}
