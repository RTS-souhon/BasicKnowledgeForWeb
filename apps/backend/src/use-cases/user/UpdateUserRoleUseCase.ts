import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import type {
    IUpdateUserRoleUseCase,
    UpdateUserRoleInput,
    UpdateUserRoleResult,
} from './IUpdateUserRoleUseCase';

export class UpdateUserRoleUseCase implements IUpdateUserRoleUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(input: UpdateUserRoleInput): Promise<UpdateUserRoleResult> {
        const existing = await this.userRepository.findById(input.id);
        if (!existing) {
            return {
                success: false,
                error: 'ユーザーが見つかりません',
                status: 404,
            };
        }

        try {
            await this.userRepository.updateRole(input.id, input.role);
            return { success: true };
        } catch {
            return {
                success: false,
                error: 'ロールの更新に失敗しました',
                status: 500,
            };
        }
    }
}
