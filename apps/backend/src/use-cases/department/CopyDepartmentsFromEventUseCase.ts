import type { IDepartmentRepository } from '@backend/src/infrastructure/repositories/departments/IDepartmentRepository';
import type {
    CopyDepartmentsFromEventInput,
    CopyDepartmentsFromEventResult,
    ICopyDepartmentsFromEventUseCase,
} from './ICopyDepartmentsFromEventUseCase';

export class CopyDepartmentsFromEventUseCase
    implements ICopyDepartmentsFromEventUseCase
{
    constructor(private readonly departmentRepository: IDepartmentRepository) {}

    async execute(
        input: CopyDepartmentsFromEventInput,
    ): Promise<CopyDepartmentsFromEventResult> {
        if (input.sourceEventId === input.targetEventId) {
            return {
                success: false,
                error: 'コピー元とコピー先の会期は別にしてください',
                status: 400,
            };
        }

        try {
            const sourceDepartments =
                await this.departmentRepository.findByEventId(
                    input.sourceEventId,
                );
            if (sourceDepartments.length === 0) {
                return {
                    success: false,
                    error: 'コピー元会期に部署がありません',
                    status: 404,
                };
            }

            const targetDepartments =
                await this.departmentRepository.findByEventId(
                    input.targetEventId,
                );
            const targetNameSet = new Set(
                targetDepartments.map((department) => department.name),
            );

            const sourceNames = Array.from(
                new Set(sourceDepartments.map((department) => department.name)),
            );
            const namesToCreate = sourceNames.filter(
                (name) => !targetNameSet.has(name),
            );

            const createdDepartments =
                await this.departmentRepository.createBulk(
                    namesToCreate.map((name) => ({
                        eventId: input.targetEventId,
                        name,
                    })),
                );

            return {
                success: true,
                data: {
                    departments: createdDepartments,
                    createdCount: createdDepartments.length,
                    skippedCount:
                        sourceNames.length - createdDepartments.length,
                },
            };
        } catch {
            return {
                success: false,
                error: '部署のコピー中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
