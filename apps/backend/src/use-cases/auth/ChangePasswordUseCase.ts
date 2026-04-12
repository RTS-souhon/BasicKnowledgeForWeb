import type { IUserRepository } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import { compare, hash } from 'bcryptjs';
import type {
    ChangePasswordInput,
    ChangePasswordResult,
    IChangePasswordUseCase,
} from './IChangePasswordUseCase';

const SALT_ROUNDS = 12;

export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(input: ChangePasswordInput): Promise<ChangePasswordResult> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            return {
                success: false,
                error: 'ユーザーが見つかりません',
                status: 404,
            };
        }

        const passwordMatch = await compare(
            input.currentPassword,
            user.password,
        );
        if (!passwordMatch) {
            return {
                success: false,
                error: '現在のパスワードが正しくありません',
                status: 400,
            };
        }

        const hashedPassword = await hash(input.newPassword, SALT_ROUNDS);
        await this.userRepository.updatePassword(user.id, hashedPassword);

        return { success: true };
    }
}
