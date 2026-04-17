import type {
    IOtherItemRepository,
    UpdateOtherItemInput as RepositoryUpdateOtherItemInput,
} from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type {
    IUpdateOtherItemUseCase,
    UpdateOtherItemInput,
    UpdateOtherItemResult,
} from './IUpdateOtherItemUseCase';

const OTHER_ITEM_IMAGE_PREFIX = 'others';

export class UpdateOtherItemUseCase implements IUpdateOtherItemUseCase {
    constructor(
        private readonly otherItemRepository: IOtherItemRepository,
        private readonly assetBaseUrl: string,
    ) {}

    async execute(input: UpdateOtherItemInput): Promise<UpdateOtherItemResult> {
        const payload: RepositoryUpdateOtherItemInput = {};
        if (input.payload.title !== undefined) {
            payload.title = input.payload.title;
        }
        if (input.payload.content !== undefined) {
            payload.content = input.payload.content;
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
        if (input.payload.displayOrder !== undefined) {
            payload.displayOrder = input.payload.displayOrder;
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.otherItemRepository.update(
                input.id,
                input.eventId,
                payload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: 'その他情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: 'その他情報の更新中にエラーが発生しました',
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
