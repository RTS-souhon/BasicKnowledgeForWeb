import type { Room } from '@backend/src/infrastructure/repositories/room/IRoomRepository';

export type GetRoomsResult =
    | { success: true; data: Room[] }
    | { success: false; error: string };

export interface IGetRoomsUseCase {
    execute(eventId: string): Promise<GetRoomsResult>;
}
