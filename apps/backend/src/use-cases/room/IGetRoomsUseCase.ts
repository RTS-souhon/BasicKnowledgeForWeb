import type { RoomWithDepartments } from '@backend/src/infrastructure/repositories/room/IRoomRepository';

export type GetRoomsResult =
    | { success: true; data: RoomWithDepartments[] }
    | { success: false; error: string };

export interface IGetRoomsUseCase {
    execute(eventId: string): Promise<GetRoomsResult>;
}
