import type {
    IProgramRepository,
    UpdateProgramInput as RepositoryUpdateProgramInput,
} from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    IUpdateProgramUseCase,
    UpdateProgramInput,
    UpdateProgramResult,
} from './IUpdateProgramUseCase';

const PROGRAM_IMAGE_PREFIX = 'programs';

export class UpdateProgramUseCase implements IUpdateProgramUseCase {
    constructor(
        private readonly programRepository: IProgramRepository,
        private readonly assetBaseUrl: string,
    ) {}

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
        if (input.payload.imageKey !== undefined) {
            if (input.payload.imageKey === null) {
                payload.imageKey = null;
                payload.imageUrl = null;
            } else {
                if (!this.isKeyAllowed(input.payload.imageKey, input.eventId)) {
                    return {
                        success: false,
                        error: 'image_key が許可されたプレフィックスではありません',
                        status: 400,
                    };
                }
                payload.imageKey = input.payload.imageKey;
                payload.imageUrl = this.buildImageUrl(input.payload.imageKey);
            }
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        if (payload.startTime !== undefined || payload.endTime !== undefined) {
            const existing = await this.programRepository.findById(
                input.id,
                input.eventId,
            );
            if (!existing) {
                return {
                    success: false,
                    error: '企画情報が見つかりません',
                    status: 404,
                };
            }
            const effectiveStart = payload.startTime ?? existing.startTime;
            const effectiveEnd = payload.endTime ?? existing.endTime;
            if (effectiveEnd <= effectiveStart) {
                return {
                    success: false,
                    error: '終了時刻は開始時刻より後である必要があります',
                    status: 400,
                };
            }
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

    private isKeyAllowed(key: string, eventId: string) {
        return key.startsWith(`${PROGRAM_IMAGE_PREFIX}/${eventId}/`);
    }

    private buildImageUrl(imageKey: string) {
        const trimmedBase = this.assetBaseUrl.replace(/\/+$/, '');
        return `${trimmedBase}/${imageKey}`;
    }
}
