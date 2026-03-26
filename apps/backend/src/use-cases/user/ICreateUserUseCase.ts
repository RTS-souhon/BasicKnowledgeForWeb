import type { User } from '@/infrastructure/repositories/user/IUserRepository';
import type { CreateUserInput } from '@/infrastructure/validators/userValidator';

export interface ICreateUserUseCase {
    execute(
        input: CreateUserInput,
    ): Promise<
        { success: true; data: User } | { success: false; error: string }
    >;
}
