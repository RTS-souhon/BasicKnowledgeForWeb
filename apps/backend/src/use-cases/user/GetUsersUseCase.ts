import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import type { IGetUsersUseCase } from './IGetUsersUseCase';

export class GetUsersUseCase implements IGetUsersUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute() {
        try {
            const allUsers = await this.userRepository.findAll();
            return { success: true as const, data: allUsers };
        } catch (error) {
            return {
                success: false as const,
                error:
                    error instanceof Error
                        ? error.message
                        : 'ユーザーの取得に失敗しました',
            };
        }
    }
}
