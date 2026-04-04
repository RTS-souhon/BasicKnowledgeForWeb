import type { rooms } from '@backend/src/db/schema';

export type Room = typeof rooms.$inferSelect;

export type RoomWithDepartments = Omit<
    Room,
    'preDayManagerId' | 'dayManagerId'
> & {
    preDayManagerId: string | null;
    preDayManagerName: string | null;
    dayManagerId: string;
    dayManagerName: string;
};

export interface IRoomRepository {
    findByEventId(eventId: string): Promise<RoomWithDepartments[]>;
}
