import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type {
    CreateAccessCodeInput,
    CreateAccessCodeResult,
    ICreateAccessCodeUseCase,
} from './ICreateAccessCodeUseCase';

export class CreateAccessCodeUseCase implements ICreateAccessCodeUseCase {
    constructor(private readonly accessCodeRepository: IAccessCodeRepository) {}

    async execute(
        input: CreateAccessCodeInput,
    ): Promise<CreateAccessCodeResult> {
        try {
            const existing = await this.accessCodeRepository.findByCode(
                input.code,
            );
            if (existing) {
                return {
                    success: false,
                    error: 'このアクセスコードは既に使用されています',
                };
            }

            const data = await this.accessCodeRepository.create({
                code: input.code,
                eventName: input.eventName,
                validFrom: new Date(input.validFrom),
                validTo: new Date(input.validTo),
                createdBy: input.createdBy,
            });

            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'アクセスコードの作成中にエラーが発生しました',
            };
        }
    }
}
