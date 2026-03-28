export type DeleteAccessCodeResult =
    | { success: true }
    | { success: false; error: string };

export interface IDeleteAccessCodeUseCase {
    execute(id: string): Promise<DeleteAccessCodeResult>;
}
