import type { AccessCode } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';

export interface IGetAccessCodeUseCase {
    execute(
        id: string,
    ): Promise<
        { success: true; data: AccessCode } | { success: false; error: string }
    >;
}
