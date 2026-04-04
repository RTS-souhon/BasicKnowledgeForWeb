import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    GetProgramsResult,
    IGetProgramsUseCase,
} from './IGetProgramsUseCase';

export class GetProgramsUseCase implements IGetProgramsUseCase {
    constructor(private readonly programRepository: IProgramRepository) {}

    async execute(eventId: string): Promise<GetProgramsResult> {
        try {
            const data = await this.programRepository.findByEventId(eventId);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '企画一覧の取得中にエラーが発生しました',
            };
        }
    }
}
