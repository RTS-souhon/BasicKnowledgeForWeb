import type { Program } from '@backend/src/infrastructure/repositories/program/IProgramRepository';

export type GetProgramsResult =
    | { success: true; data: Program[] }
    | { success: false; error: string };

export interface IGetProgramsUseCase {
    execute(eventId: string): Promise<GetProgramsResult>;
}
