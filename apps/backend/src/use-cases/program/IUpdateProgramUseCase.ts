import type { Program } from '@backend/src/infrastructure/repositories/program/IProgramRepository';

export type UpdateProgramInput = {
    id: string;
    eventId: string;
    payload: {
        name?: string;
        location?: string;
        startTime?: string;
        endTime?: string;
        description?: string | null;
        imageKey?: string | null;
    };
};

export type UpdateProgramResult =
    | { success: true; data: Program }
    | { success: false; error: string; status?: number };

export interface IUpdateProgramUseCase {
    execute(input: UpdateProgramInput): Promise<UpdateProgramResult>;
}
