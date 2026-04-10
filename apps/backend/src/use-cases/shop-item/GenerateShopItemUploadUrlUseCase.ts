import type { R2Bucket } from '@backend/src/db/connection';
import type {
    GenerateShopItemUploadUrlInput,
    GenerateShopItemUploadUrlResult,
    IGenerateShopItemUploadUrlUseCase,
} from './IGenerateShopItemUploadUrlUseCase';

const SHOP_ITEM_PREFIX = 'shop-items';
const DEFAULT_EXPIRATION_SECONDS = 300;
const DEFAULT_CONTENT_TYPE = 'image/webp';

type R2BucketWithPresign = R2Bucket & {
    createPresignedUrl: (options: {
        method: string;
        key: string;
        expiration: number;
        headers?: Record<string, string>;
    }) => Promise<{
        url: string;
        method: string;
        headers: Headers;
    }>;
};

export class GenerateShopItemUploadUrlUseCase
    implements IGenerateShopItemUploadUrlUseCase
{
    constructor(private readonly bucket: R2Bucket) {}

    async execute(
        input: GenerateShopItemUploadUrlInput,
    ): Promise<GenerateShopItemUploadUrlResult> {
        try {
            const key = this.buildKey(input.eventId, input.fileName);
            const presigned = await (
                this.bucket as R2BucketWithPresign
            ).createPresignedUrl({
                method: 'PUT',
                key,
                expiration: DEFAULT_EXPIRATION_SECONDS,
                headers: {
                    'content-type': input.contentType ?? DEFAULT_CONTENT_TYPE,
                },
            });

            return {
                success: true,
                data: {
                    imageKey: key,
                    uploadUrl: presigned.url,
                    method: presigned.method,
                    headers: Object.fromEntries(presigned.headers.entries()),
                },
            };
        } catch {
            return {
                success: false,
                error: 'アップロードURLの生成に失敗しました',
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
