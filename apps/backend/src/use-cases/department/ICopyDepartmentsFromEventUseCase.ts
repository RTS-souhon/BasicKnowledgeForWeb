import type { Department } from '@backend/src/infrastructure/repositories/departments/IDepartmentRepository';

export type CopyDepartmentsFromEventInput = {
    sourceEventId: string;
    targetEventId: string;
};

export type CopyDepartmentsFromEventData = {
    departments: Department[];
    createdCount: number;
    skippedCount: number;
};

export type CopyDepartmentsFromEventResult =
    | { success: true; data: CopyDepartmentsFromEventData }
    | { success: false; error: string; status?: number };

export interface ICopyDepartmentsFromEventUseCase {
    execute(
        input: CopyDepartmentsFromEventInput,
    ): Promise<CopyDepartmentsFromEventResult>;
}
