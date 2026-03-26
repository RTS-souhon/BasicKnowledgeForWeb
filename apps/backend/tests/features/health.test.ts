import { describe, expect, it, jest } from '@jest/globals';
import type { IHealthRepository } from '@/infrastructure/repositories/health/IHealthRepository';
import { createTestAppWithHealth } from '../helpers/createTestApp';

function createMockHealthRepository(
    overrides: Partial<IHealthRepository> = {},
): IHealthRepository {
    return {
        checkConnection: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
        ...overrides,
    };
}

describe('GET /api/health', () => {
    it('DBが正常な場合、200とstatus:okを返す', async () => {
        const repository = createMockHealthRepository();
        const app = createTestAppWithHealth(repository);

        const res = await app.request('/api/health');
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ status: 'ok', db: 'connected' });
    });

    it('DB接続に失敗した場合、503とstatus:errorを返す', async () => {
        const repository = createMockHealthRepository({
            checkConnection: jest
                .fn<() => Promise<boolean>>()
                .mockResolvedValue(false),
        });
        const app = createTestAppWithHealth(repository);

        const res = await app.request('/api/health');
        const body = await res.json();

        expect(res.status).toBe(503);
        expect(body).toEqual({ status: 'error', db: 'disconnected' });
    });

    it('リポジトリが例外をスローした場合、500を返す', async () => {
        const repository = createMockHealthRepository({
            checkConnection: jest
                .fn<() => Promise<boolean>>()
                .mockRejectedValue(new Error('DB connection failed')),
        });
        const app = createTestAppWithHealth(repository);

        const res = await app.request('/api/health');

        expect(res.status).toBe(500);
    });
});
