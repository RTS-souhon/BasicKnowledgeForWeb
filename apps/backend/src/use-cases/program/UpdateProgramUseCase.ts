import type {
    IProgramRepository,
    UpdateProgramInput as RepositoryUpdateProgramInput,
} from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    IUpdateProgramUseCase,
    UpdateProgramInput,
    UpdateProgramResult,
} from './IUpdateProgramUseCase';

export class UpdateProgramUseCase implements IUpdateProgramUseCase {
    constructor(private readonly programRepository: IProgramRepository) {}

    async execute(input: UpdateProgramInput): Promise<UpdateProgramResult> {
        const payload: RepositoryUpdateProgramInput = {};
        if (input.payload.name !== undefined) {
            payload.name = input.payload.name;
        }
        if (input.payload.location !== undefined) {
            payload.location = input.payload.location;
        }
        if (input.payload.startTime !== undefined) {
            payload.startTime = new Date(input.payload.startTime);
        }
        if (input.payload.endTime !== undefined) {
            payload.endTime = new Date(input.payload.endTime);
        }
        if (input.payload.description !== undefined) {
            payload.description = input.payload.description;
        }

        if (payload.startTime && payload.endTime) {
            if ((payload.endTime as Date) <= (payload.startTime as Date)) {
                return {
                    success: false,
                    error: '終了時刻は開始時刻より後である必要があります',
                    status: 400,
                };
            }
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.programRepository.update(
                input.id,
                input.eventId,
                payload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: '企画情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: '企画情報の更新中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
