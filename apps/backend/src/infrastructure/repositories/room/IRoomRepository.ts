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

export type CreateRoomInput = Omit<
    typeof rooms.$inferInsert,
    'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateRoomInput = Partial<
    Omit<
        typeof rooms.$inferInsert,
        'id' | 'eventId' | 'createdAt' | 'updatedAt'
    >
>;

export interface IRoomRepository {
    findByEventId(eventId: string): Promise<RoomWithDepartments[]>;
    search(keyword: string, eventId: string): Promise<RoomWithDepartments[]>;
    create(input: CreateRoomInput): Promise<RoomWithDepartments>;
    update(
        id: string,
        eventId: string,
        input: UpdateRoomInput,
    ): Promise<RoomWithDepartments | null>;
    delete(id: string, eventId: string): Promise<boolean>;
}
