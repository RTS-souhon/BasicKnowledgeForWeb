import type { R2Bucket } from '@backend/src/db/connection';
import type {
    IUploadShopItemImageUseCase,
    UploadShopItemImageInput,
    UploadShopItemImageResult,
} from './IUploadShopItemImageUseCase';

const SHOP_ITEM_PREFIX = 'shop-items';

export class UploadShopItemImageUseCase implements IUploadShopItemImageUseCase {
    constructor(private readonly bucket: R2Bucket) {}

    async execute(
        input: UploadShopItemImageInput,
    ): Promise<UploadShopItemImageResult> {
        try {
            const key = this.buildKey(input.eventId, input.fileName);
            await this.bucket.put(key, input.body, {
                httpMetadata: { contentType: input.contentType },
            });
            return { success: true, data: { imageKey: key } };
        } catch {
            return {
                success: false,
                error: '画像のアップロードに失敗しました',
                status: 500,
            };
        }
    }

    private buildKey(eventId: string, fileName?: string) {
        const extension = this.extractExtension(fileName);
        const uniqueId = crypto.randomUUID();
        return `${SHOP_ITEM_PREFIX}/${eventId}/${uniqueId}${extension}`;
    }

    private extractExtension(fileName?: string) {
        if (!fileName) {
            return '.webp';
        }
        const parts = fileName.split('.');
        if (parts.length < 2) {
            return '.webp';
        }
        const ext = parts.pop()?.toLowerCase() ?? 'webp';
        return `.${ext.replace(/[^a-z0-9]/g, '') || 'webp'}`;
    }
}
