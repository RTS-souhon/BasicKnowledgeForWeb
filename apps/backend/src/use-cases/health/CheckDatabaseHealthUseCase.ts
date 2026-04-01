import type { IHealthRepository } from '@backend/src/infrastructure/repositories/health/IHealthRepository';
import type { ICheckDatabaseHealthUseCase } from './ICheckDatabaseHealthUseCase';

export class CheckDatabaseHealthUseCase implements ICheckDatabaseHealthUseCase {
    constructor(private readonly healthRepository: IHealthRepository) {}

    async execute(): Promise<{ success: boolean }> {
        const isConnected = await this.healthRepository.checkConnection();
        return { success: isConnected };
    }
}
