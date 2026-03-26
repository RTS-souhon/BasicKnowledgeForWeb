import { describe, expect, it } from '@jest/globals';
import type { IHealthRepository } from '@backend/src/infrastructure/repositories/health/IHealthRepository';
import { CheckDatabaseHealthUseCase } from '@backend/src/use-cases/health/CheckDatabaseHealthUseCase';

describe('CheckDatabaseHealthUseCase', () => {
    it('DB接続成功時にsuccess: trueを返す', async () => {
        const mockRepo: IHealthRepository = {
            checkConnection: async () => true,
        };
        const useCase = new CheckDatabaseHealthUseCase(mockRepo);
        const result = await useCase.execute();
        expect(result).toEqual({ success: true });
    });

    it('DB接続失敗時にsuccess: falseを返す', async () => {
        const mockRepo: IHealthRepository = {
            checkConnection: async () => false,
        };
        const useCase = new CheckDatabaseHealthUseCase(mockRepo);
        const result = await useCase.execute();
        expect(result).toEqual({ success: false });
    });
});
