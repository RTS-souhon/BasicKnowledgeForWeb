import type { RoomWithDepartments } from '@backend/src/infrastructure/repositories/room/IRoomRepository';

export type CreateRoomInput = {
    eventId: string;
    buildingName: string;
    floor: string;
    roomName: string;
    preDayManagerId?: string | null;
    preDayPurpose?: string | null;
    dayManagerId: string;
    dayPurpose: string;
    notes?: string | null;
};

export type CreateRoomResult =
    | { success: true; data: RoomWithDepartments }
    | { success: false; error: string; status?: number };

export interface ICreateRoomUseCase {
    execute(input: CreateRoomInput): Promise<CreateRoomResult>;
}
