import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type {
    GetAccessCodesResult,
    IGetAccessCodesUseCase,
} from './IGetAccessCodesUseCase';

export class GetAccessCodesUseCase implements IGetAccessCodesUseCase {
    constructor(private readonly accessCodeRepository: IAccessCodeRepository) {}

    async execute(): Promise<GetAccessCodesResult> {
        try {
            const data = await this.accessCodeRepository.findAll();
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: 'アクセスコードの取得中にエラーが発生しました',
            };
        }
    }
}
