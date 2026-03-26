import bcrypt from 'bcryptjs';
import type { IUserRepository } from '@/infrastructure/repositories/user/IUserRepository';
import type { IAuthenticateUserUseCase } from './IAuthenticateUserUseCase';

export interface AuthenticateUserInput {
    email: string;
    password: string;
}

export class AuthenticateUserUseCase implements IAuthenticateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(input: AuthenticateUserInput) {
        try {
            const user = await this.userRepository.findByEmail(input.email);
            if (!user) {
                return {
                    success: false as const,
                    error: 'メールアドレスまたはパスワードが正しくありません',
                };
            }

            const isPasswordValid = await bcrypt.compare(
                input.password,
                user.password,
            );
            if (!isPasswordValid) {
                return {
                    success: false as const,
                    error: 'メールアドレスまたはパスワードが正しくありません',
                };
            }

            const { password: _password, ...userWithoutPassword } = user;
            return { success: true as const, data: userWithoutPassword };
        } catch (error) {
            return {
                success: false as const,
                error:
                    error instanceof Error
                        ? error.message
                        : '認証に失敗しました',
            };
        }
    }
}
