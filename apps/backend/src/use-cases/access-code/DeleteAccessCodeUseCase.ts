import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type {
    DeleteAccessCodeResult,
    IDeleteAccessCodeUseCase,
} from './IDeleteAccessCodeUseCase';

export class DeleteAccessCodeUseCase implements IDeleteAccessCodeUseCase {
    constructor(private readonly accessCodeRepository: IAccessCodeRepository) {}

    async execute(id: string): Promise<DeleteAccessCodeResult> {
        try {
            await this.accessCodeRepository.deleteById(id);
            return { success: true };
        } catch {
            return {
                success: false,
                error: 'アクセスコードの削除中にエラーが発生しました',
            };
        }
    }
}
