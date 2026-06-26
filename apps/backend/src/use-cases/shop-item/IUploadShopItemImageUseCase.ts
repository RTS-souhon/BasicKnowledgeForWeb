export type UploadShopItemImageInput = {
    eventId: string;
    body: ArrayBuffer;
    contentType: string;
    fileName?: string;
};

export type UploadShopItemImageResult =
    | { success: true; data: { imageKey: string } }
    | { success: false; error: string; status?: number };

export interface IUploadShopItemImageUseCase {
    execute(
        input: UploadShopItemImageInput,
    ): Promise<UploadShopItemImageResult>;
}
