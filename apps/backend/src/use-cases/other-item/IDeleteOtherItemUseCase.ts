export type DeleteOtherItemInput = {
    id: string;
    eventId: string;
};

export type DeleteOtherItemResult =
    | { success: true; data: { id: string } }
    | { success: false; error: string; status?: number };

export interface IDeleteOtherItemUseCase {
    execute(input: DeleteOtherItemInput): Promise<DeleteOtherItemResult>;
}
