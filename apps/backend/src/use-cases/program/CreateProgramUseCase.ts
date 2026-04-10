import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    CreateProgramInput,
    CreateProgramResult,
    ICreateProgramUseCase,
} from './ICreateProgramUseCase';

export class CreateProgramUseCase implements ICreateProgramUseCase {
    constructor(private readonly programRepository: IProgramRepository) {}

    async execute(input: CreateProgramInput): Promise<CreateProgramResult> {
        const start = new Date(input.startTime);
        const end = new Date(input.endTime);
        if (end <= start) {
            return {
                success: false,
                error: '終了時刻は開始時刻より後である必要があります',
                status: 400,
            };
        }

        try {
            const data = await this.programRepository.create({
                eventId: input.eventId,
                name: input.name,
                location: input.location,
                startTime: start,
                endTime: end,
                description: input.description ?? null,
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '企画情報の作成中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
