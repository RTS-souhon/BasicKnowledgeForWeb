import type { RoomWithDepartments } from '@backend/src/infrastructure/repositories/room/IRoomRepository';

export type UpdateRoomInput = {
    id: string;
    eventId: string;
    payload: {
        buildingName?: string;
        floor?: string;
        roomName?: string;
        preDayManagerId?: string | null;
        preDayPurpose?: string | null;
        dayManagerId?: string;
        dayPurpose?: string;
        notes?: string | null;
    };
};

export type UpdateRoomResult =
    | { success: true; data: RoomWithDepartments }
    | { success: false; error: string; status?: number };

export interface IUpdateRoomUseCase {
    execute(input: UpdateRoomInput): Promise<UpdateRoomResult>;
}
