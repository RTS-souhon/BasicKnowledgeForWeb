import type {
    AccessCode,
    IAccessCodeRepository,
} from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type { IGetAccessCodeUseCase } from './IGetAccessCodeUseCase';

export class GetAccessCodeUseCase implements IGetAccessCodeUseCase {
    constructor(private readonly repository: IAccessCodeRepository) {}

    async execute(
        id: string,
    ): Promise<
        { success: true; data: AccessCode } | { success: false; error: string }
    > {
        const code = await this.repository.findById(id);
        if (!code) {
            return { success: false, error: 'アクセスコードが見つかりません' };
        }
        return { success: true, data: code };
    }
}
