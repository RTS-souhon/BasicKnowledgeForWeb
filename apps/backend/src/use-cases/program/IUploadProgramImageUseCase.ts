export type UploadProgramImageInput = {
    eventId: string;
    body: ArrayBuffer;
    contentType: string;
    fileName?: string;
};

export type UploadProgramImageResult =
    | { success: true; data: { imageKey: string } }
    | { success: false; error: string; status?: number };

export interface IUploadProgramImageUseCase {
    execute(input: UploadProgramImageInput): Promise<UploadProgramImageResult>;
}
