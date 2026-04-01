import { Hono } from 'hono';
import { describe, expect, it } from '@jest/globals';
import { checkHealth } from '@backend/src/presentation/controllers/healthController';
import type { ICheckDatabaseHealthUseCase } from '@backend/src/use-cases/health/ICheckDatabaseHealthUseCase';

function createMockUseCase(success: boolean): ICheckDatabaseHealthUseCase {
    return { execute: async () => ({ success }) };
}

function createTestApp(useCase: ICheckDatabaseHealthUseCase) {
    const app = new Hono();
    app.get('/health', (c) => checkHealth(c, useCase));
    return app;
}

describe('checkHealth controller', () => {
    it('DB接続成功時に200とok statusを返す', async () => {
        const app = createTestApp(createMockUseCase(true));

        const res = await app.request('/health');

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: 'ok', db: 'connected' });
    });

    it('DB接続失敗時に503とerror statusを返す', async () => {
        const app = createTestApp(createMockUseCase(false));

        const res = await app.request('/health');

        expect(res.status).toBe(503);
        expect(await res.json()).toEqual({ status: 'error', db: 'disconnected' });
    });
});
