export type DeleteTimetableItemInput = {
    id: string;
    eventId: string;
};

export type DeleteTimetableItemResult =
    | { success: true; data: { id: string } }
    | { success: false; error: string; status?: number };

export interface IDeleteTimetableItemUseCase {
    execute(
        input: DeleteTimetableItemInput,
    ): Promise<DeleteTimetableItemResult>;
}
