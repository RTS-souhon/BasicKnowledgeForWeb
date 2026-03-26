import bcrypt from 'bcryptjs';
import type { IUserRepository } from '@/infrastructure/repositories/user/IUserRepository';
import type { CreateUserInput } from '@/infrastructure/validators/userValidator';
import type { ICreateUserUseCase } from './ICreateUserUseCase';

export class CreateUserUseCase implements ICreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(input: CreateUserInput) {
        try {
            const existingUser = await this.userRepository.findByEmail(
                input.email,
            );
            if (existingUser) {
                return {
                    success: false as const,
                    error: 'このメールアドレスは既に使用されています',
                };
            }

            const hashedPassword = await bcrypt.hash(input.password, 12);
            const newUser = await this.userRepository.create({
                name: input.name,
                email: input.email,
                password: hashedPassword,
                role: input.role ?? 'user',
            });

            return { success: true as const, data: newUser };
        } catch (error) {
            return {
                success: false as const,
                error:
                    error instanceof Error
                        ? error.message
                        : 'ユーザーの作成に失敗しました',
            };
        }
    }
}
