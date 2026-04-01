import type { IAccessCodeRepository } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';
import type {
    DeleteAccessCodeResult,
    IDeleteAccessCodeUseCase,
} from './IDeleteAccessCodeUseCase';

export class DeleteAccessCodeUseCase implements IDeleteAccessCodeUseCase {
    constructor(private readonly accessCodeRepository: IAccessCodeRepository) {}

    async execute(id: string): Promise<DeleteAccessCodeResult> {
        try {
            const deleted = await this.accessCodeRepository.deleteById(id);
            if (!deleted) {
                return {
                    success: false,
                    error: 'コードが見つかりません',
                    status: 404,
                };
            }
            return { success: true };
        } catch {
            return {
                success: false,
                error: 'アクセスコードの削除中にエラーが発生しました',
            };
        }
    }
}
