import type { Program } from '@backend/src/infrastructure/repositories/program/IProgramRepository';

export type CreateProgramInput = {
    eventId: string;
    name: string;
    location: string;
    startTime: string;
    endTime: string;
    description?: string | null;
};

export type CreateProgramResult =
    | { success: true; data: Program }
    | { success: false; error: string; status?: number };

export interface ICreateProgramUseCase {
    execute(input: CreateProgramInput): Promise<CreateProgramResult>;
}
