import { describe, expect, it, jest } from '@jest/globals';
import type {
    Department,
    IDepartmentRepository,
} from '@backend/src/infrastructure/repositories/departments/IDepartmentRepository';
import { CopyDepartmentsFromEventUseCase } from '@backend/src/use-cases/department/CopyDepartmentsFromEventUseCase';

const SOURCE_EVENT_ID = '00000000-0000-4000-8000-000000000001';
const TARGET_EVENT_ID = '00000000-0000-4000-8000-000000000002';

const baseDepartment: Department = {
    id: '60000000-0000-4000-8000-000000000001',
    eventId: SOURCE_EVENT_ID,
    name: '企画部',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

function createMockRepository(
    overrides: Partial<IDepartmentRepository> = {},
): jest.Mocked<IDepartmentRepository> {
    return {
        findByEventId: jest
            .fn<IDepartmentRepository['findByEventId']>()
            .mockImplementation(() => Promise.resolve([])),
        create: jest
            .fn<IDepartmentRepository['create']>()
            .mockImplementation((input) =>
                Promise.resolve({
                    ...baseDepartment,
                    id: crypto.randomUUID(),
                    eventId: input.eventId,
                    name: input.name,
                }),
            ),
        createBulk: jest
            .fn<IDepartmentRepository['createBulk']>()
            .mockImplementation((inputs) =>
                Promise.resolve(
                    inputs.map((input, index) => ({
                        ...baseDepartment,
                        id: `bulk-${index + 1}`,
                        eventId: input.eventId,
                        name: input.name,
                    })),
                ),
            ),
        update: jest
            .fn<IDepartmentRepository['update']>()
            .mockImplementation(() => Promise.resolve(null)),
        delete: jest
            .fn<IDepartmentRepository['delete']>()
            .mockImplementation(() => Promise.resolve(false)),
        ...overrides,
    } as jest.Mocked<IDepartmentRepository>;
}

describe('CopyDepartmentsFromEventUseCase', () => {
    it('コピー元とコピー先が同一会期なら 400 を返す', async () => {
        const repository = createMockRepository();
        const useCase = new CopyDepartmentsFromEventUseCase(repository);

        const result = await useCase.execute({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: SOURCE_EVENT_ID,
        });

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.status).toBe(400);
        expect(repository.findByEventId).not.toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('重複名を除外してコピー先会期へ作成する', async () => {
        const sourceDepartments: Department[] = [
            { ...baseDepartment, id: 's1', name: '企画部' },
            { ...baseDepartment, id: 's2', name: '広報部' },
            { ...baseDepartment, id: 's3', name: '広報部' },
        ];
        const targetDepartments: Department[] = [
            {
                ...baseDepartment,
                id: 't1',
                eventId: TARGET_EVENT_ID,
                name: '企画部',
            },
        ];
        const createdDepartments: Department[] = [
            {
                ...baseDepartment,
                id: 't2',
                eventId: TARGET_EVENT_ID,
                name: '広報部',
            },
        ];
        const createBulk = jest
            .fn<IDepartmentRepository['createBulk']>()
            .mockImplementation(() => Promise.resolve(createdDepartments));
        const repository = createMockRepository({
            findByEventId: jest
                .fn<IDepartmentRepository['findByEventId']>()
                .mockImplementation((eventId) =>
                    Promise.resolve(
                        eventId === SOURCE_EVENT_ID
                            ? sourceDepartments
                            : targetDepartments,
                    ),
                ),
            createBulk,
        });
        const useCase = new CopyDepartmentsFromEventUseCase(repository);

        const result = await useCase.execute({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: TARGET_EVENT_ID,
        });

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.createdCount).toBe(1);
        expect(result.data.skippedCount).toBe(1);
        expect(result.data.departments).toEqual(createdDepartments);
        expect(createBulk).toHaveBeenCalledTimes(1);
        expect(createBulk).toHaveBeenCalledWith([
            {
                eventId: TARGET_EVENT_ID,
                name: '広報部',
            },
        ]);
    });

    it('コピー対象がない場合でも createBulk は空配列で1回呼ばれる', async () => {
        const sourceDepartments: Department[] = [
            { ...baseDepartment, id: 's1', name: '企画部' },
        ];
        const targetDepartments: Department[] = [
            {
                ...baseDepartment,
                id: 't1',
                eventId: TARGET_EVENT_ID,
                name: '企画部',
            },
        ];
        const createBulk = jest
            .fn<IDepartmentRepository['createBulk']>()
            .mockImplementation(() => Promise.resolve([]));
        const repository = createMockRepository({
            findByEventId: jest
                .fn<IDepartmentRepository['findByEventId']>()
                .mockImplementation((eventId) =>
                    Promise.resolve(
                        eventId === SOURCE_EVENT_ID
                            ? sourceDepartments
                            : targetDepartments,
                    ),
                ),
            createBulk,
        });
        const useCase = new CopyDepartmentsFromEventUseCase(repository);

        const result = await useCase.execute({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: TARGET_EVENT_ID,
        });

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.createdCount).toBe(0);
        expect(result.data.skippedCount).toBe(1);
        expect(createBulk).toHaveBeenCalledWith([]);
    });

    it('コピー元会期に部署がない場合は 404 を返す', async () => {
        const repository = createMockRepository({
            findByEventId: jest
                .fn<IDepartmentRepository['findByEventId']>()
                .mockResolvedValue([]),
        });
        const useCase = new CopyDepartmentsFromEventUseCase(repository);

        const result = await useCase.execute({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: TARGET_EVENT_ID,
        });

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.status).toBe(404);
        expect(repository.createBulk).not.toHaveBeenCalled();
    });

    it('リポジトリエラー時は 500 を返す', async () => {
        const repository = createMockRepository({
            findByEventId: jest
                .fn<IDepartmentRepository['findByEventId']>()
                .mockImplementation(() => {
                    throw new Error('db-error');
                }),
        });
        const useCase = new CopyDepartmentsFromEventUseCase(repository);

        const result = await useCase.execute({
            sourceEventId: SOURCE_EVENT_ID,
            targetEventId: TARGET_EVENT_ID,
        });

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.status).toBe(500);
        expect(result.error).toBe('部署のコピー中にエラーが発生しました');
    });
});
