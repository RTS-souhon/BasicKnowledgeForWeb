export type DeleteProgramInput = {
    id: string;
    eventId: string;
};

export type DeleteProgramResult =
    | { success: true; data: { id: string } }
    | { success: false; error: string; status?: number };

export interface IDeleteProgramUseCase {
    execute(input: DeleteProgramInput): Promise<DeleteProgramResult>;
}
