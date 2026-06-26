import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type {
    CreateProgramInput,
    CreateProgramResult,
    ICreateProgramUseCase,
} from './ICreateProgramUseCase';

const PROGRAM_IMAGE_PREFIX = 'programs';

export class CreateProgramUseCase implements ICreateProgramUseCase {
    constructor(
        private readonly programRepository: IProgramRepository,
        private readonly assetBaseUrl: string,
    ) {}

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

        if (
            input.imageKey !== undefined &&
            input.imageKey !== null &&
            !this.isKeyAllowed(input.imageKey, input.eventId)
        ) {
            return {
                success: false,
                error: 'image_key が許可されたプレフィックスではありません',
                status: 400,
            };
        }

        const imageKey = input.imageKey ?? null;

        try {
            const data = await this.programRepository.create({
                eventId: input.eventId,
                name: input.name,
                location: input.location,
                startTime: start,
                endTime: end,
                description: input.description ?? null,
                imageKey,
                imageUrl: imageKey ? this.buildImageUrl(imageKey) : null,
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

    private isKeyAllowed(key: string, eventId: string) {
        return key.startsWith(`${PROGRAM_IMAGE_PREFIX}/${eventId}/`);
    }

    private buildImageUrl(imageKey: string) {
        const trimmedBase = this.assetBaseUrl.replace(/\/+$/, '');
        return `${trimmedBase}/${imageKey}`;
    }
}
