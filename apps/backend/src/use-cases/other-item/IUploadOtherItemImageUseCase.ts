export type UploadOtherItemImageInput = {
    eventId: string;
    body: ArrayBuffer;
    contentType: string;
    fileName?: string;
};

export type UploadOtherItemImageResult =
    | { success: true; data: { imageKey: string } }
    | { success: false; error: string; status?: number };

export interface IUploadOtherItemImageUseCase {
    execute(
        input: UploadOtherItemImageInput,
    ): Promise<UploadOtherItemImageResult>;
}
