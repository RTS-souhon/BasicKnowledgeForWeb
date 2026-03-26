export interface ICheckDatabaseHealthUseCase {
    execute(): Promise<{ success: boolean }>;
}
