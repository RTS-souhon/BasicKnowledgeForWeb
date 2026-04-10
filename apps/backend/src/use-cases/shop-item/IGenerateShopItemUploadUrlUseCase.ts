export type GenerateShopItemUploadUrlInput = {
    eventId: string;
    fileName?: string;
    contentType?: string;
};

export type GenerateShopItemUploadUrlResult =
    | {
          success: true;
          data: {
              imageKey: string;
              uploadUrl: string;
              headers: Record<string, string>;
              method: string;
          };
      }
    | { success: false; error: string; status?: number };

export interface IGenerateShopItemUploadUrlUseCase {
    execute(
        input: GenerateShopItemUploadUrlInput,
    ): Promise<GenerateShopItemUploadUrlResult>;
}
