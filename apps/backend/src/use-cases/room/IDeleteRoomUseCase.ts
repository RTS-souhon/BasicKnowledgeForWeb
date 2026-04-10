export type DeleteRoomInput = {
    id: string;
    eventId: string;
};

export type DeleteRoomResult =
    | { success: true; data: { id: string } }
    | { success: false; error: string; status?: number };

export interface IDeleteRoomUseCase {
    execute(input: DeleteRoomInput): Promise<DeleteRoomResult>;
}
