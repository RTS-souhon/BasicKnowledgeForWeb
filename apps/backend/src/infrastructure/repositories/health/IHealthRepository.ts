export interface IHealthRepository {
    checkConnection(): Promise<boolean>;
}
