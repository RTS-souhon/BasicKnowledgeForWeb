import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    CreateOtherItemInput,
    CreateOtherItemResult,
    ICreateOtherItemUseCase,
} from './ICreateOtherItemUseCase';

const OTHER_ITEM_IMAGE_PREFIX = 'others';

export class CreateOtherItemUseCase implements ICreateOtherItemUseCase {
    constructor(
        private readonly otherItemRepository: IOtherItemRepository,
        private readonly assetBaseUrl: string,
    ) {}

    async execute(input: CreateOtherItemInput): Promise<CreateOtherItemResult> {
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
            const data = await this.otherItemRepository.create({
                eventId: input.eventId,
                title: input.title,
                content: input.content,
                imageKey,
                imageUrl: imageKey ? this.buildImageUrl(imageKey) : null,
                displayOrder: input.displayOrder,
                createdBy: input.createdBy,
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'その他情報の作成中にエラーが発生しました',
                status: 500,
            };
        }
    }

    private isKeyAllowed(key: string, eventId: string) {
        return key.startsWith(`${OTHER_ITEM_IMAGE_PREFIX}/${eventId}/`);
    }

    private buildImageUrl(imageKey: string) {
        const trimmedBase = this.assetBaseUrl.replace(/\/+$/, '');
        return `${trimmedBase}/${imageKey}`;
    }
}
