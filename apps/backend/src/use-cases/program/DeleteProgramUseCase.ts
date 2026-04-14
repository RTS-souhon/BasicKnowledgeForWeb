import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    DeleteProgramInput,
    DeleteProgramResult,
    IDeleteProgramUseCase,
} from './IDeleteProgramUseCase';

export class DeleteProgramUseCase implements IDeleteProgramUseCase {
    constructor(private readonly programRepository: IProgramRepository) {}

    async execute(input: DeleteProgramInput): Promise<DeleteProgramResult> {
        try {
            const deleted = await this.programRepository.delete(
                input.id,
                input.eventId,
            );
            if (!deleted) {
                return {
                    success: false,
                    error: '企画情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: { id: input.id } };
        } catch {
            return {
                success: false,
                error: '企画情報の削除中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
