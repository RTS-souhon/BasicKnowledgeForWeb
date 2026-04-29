import type { Env } from '@backend/src/db/connection';
import type { Department } from '@backend/src/infrastructure/repositories/departments/IDepartmentRepository';
import { copyDepartmentsFromEvent } from '@backend/src/presentation/controllers/departmentController';
import type { ContentEditVariables } from '@backend/src/presentation/middleware/contentEditMiddleware';
import type { ICopyDepartmentsFromEventUseCase } from '@backend/src/use-cases/department/ICopyDepartmentsFromEventUseCase';
import { describe, expect, it, jest } from '@jest/globals';
import { Hono } from 'hono';

const TARGET_EVENT_ID = '00000000-0000-4000-8000-000000000001';
const SOURCE_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const copiedDepartment: Department = {
    id: '60000000-0000-4000-8000-000000000010',
    eventId: TARGET_EVENT_ID,
    name: '広報部',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

function createApp(useCase: ICopyDepartmentsFromEventUseCase) {
    const app = new Hono<{ Bindings: Env; Variables: ContentEditVariables }>();
    app.use('*', async (c, next) => {
        c.set('eventId', TARGET_EVENT_ID);
        await next();
    });
    app.post('/departments/copy', (c) => copyDepartmentsFromEvent(c, useCase));
    return app;
}

describe('departmentController copyDepartmentsFromEvent', () => {
    it('正常系で 200 を返し useCase に source/target eventId を渡す', async () => {
        const useCase: ICopyDepartmentsFromEventUseCase = {
            execute: jest
                .fn<ICopyDepartmentsFromEventUseCase['execute']>()
                .mockResolvedValue({
                    success: true,
                    data: {
                        departments: [copiedDepartment],
                        createdCount: 1,
                        skippedCount: 0,
                    },
                }),
        };
        const app = createApp(useCase);

        const res = await app.request('/departments/copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_event_id: SOURCE_EVENT_ID }),
        });

        expect(res.status).toBe(200);
        expect(useCase.execute).toHaveBeenCalledWith({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: TARGET_EVENT_ID,
        });
        expect(await res.json()).toEqual({
            departments: [
                {
                    ...copiedDepartment,
                    createdAt: '2025-01-01T00:00:00.000Z',
                    updatedAt: '2025-01-01T00:00:00.000Z',
                },
            ],
            createdCount: 1,
            skippedCount: 0,
        });
    });

    it('source_event_id が不正な場合は 400 を返す', async () => {
        const useCase: ICopyDepartmentsFromEventUseCase = {
            execute: jest
                .fn<ICopyDepartmentsFromEventUseCase['execute']>()
                .mockResolvedValue({
                    success: true,
                    data: {
                        departments: [],
                        createdCount: 0,
                        skippedCount: 0,
                    },
                }),
        };
        const app = createApp(useCase);

        const res = await app.request('/departments/copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_event_id: 'invalid' }),
        });

        expect(res.status).toBe(400);
        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('useCase エラーの status を反映する', async () => {
        const useCase: ICopyDepartmentsFromEventUseCase = {
            execute: jest
                .fn<ICopyDepartmentsFromEventUseCase['execute']>()
                .mockResolvedValue({
                    success: false,
                    error: 'コピー元会期に部署がありません',
                    status: 404,
                }),
        };
        const app = createApp(useCase);

        const res = await app.request('/departments/copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_event_id: SOURCE_EVENT_ID }),
        });

        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({
            error: 'コピー元会期に部署がありません',
        });
    });
});
