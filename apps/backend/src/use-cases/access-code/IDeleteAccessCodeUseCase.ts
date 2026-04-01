export type DeleteAccessCodeResult =
    | { success: true }
    | { success: false; error: string; status?: 404 };

export interface IDeleteAccessCodeUseCase {
    execute(id: string): Promise<DeleteAccessCodeResult>;
}
