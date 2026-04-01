import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import { sign } from 'hono/jwt';
import type {
    IVerifyAccessCodeUseCase,
    VerifyAccessCodeInput,
    VerifyAccessCodeResult,
} from './IVerifyAccessCodeUseCase';

export class VerifyAccessCodeUseCase implements IVerifyAccessCodeUseCase {
    constructor(private readonly accessCodeRepository: IAccessCodeRepository) {}

    async execute(
        input: VerifyAccessCodeInput,
    ): Promise<VerifyAccessCodeResult> {
        try {
            const accessCode = await this.accessCodeRepository.findByCode(
                input.code,
            );
            if (!accessCode) {
                return {
                    success: false,
                    error: 'アクセスコードが正しくありません',
                };
            }

            const now = new Date();
            if (now < accessCode.validFrom || now > accessCode.validTo) {
                return {
                    success: false,
                    error: 'アクセスコードの有効期限が切れています',
                };
            }

            const exp = Math.floor(accessCode.validTo.getTime() / 1000);
            const token = await sign(
                { event_id: accessCode.id, exp },
                input.jwtSecret,
            );

            return { success: true, token };
        } catch {
            return {
                success: false,
                error: 'アクセスコードの確認中にエラーが発生しました',
            };
        }
    }
}
