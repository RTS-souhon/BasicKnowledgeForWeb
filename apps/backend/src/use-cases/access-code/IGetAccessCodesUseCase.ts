import type { AccessCode } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';

export type GetAccessCodesResult =
    | { success: true; data: AccessCode[] }
    | { success: false; error: string };

export interface IGetAccessCodesUseCase {
    execute(): Promise<GetAccessCodesResult>;
}
