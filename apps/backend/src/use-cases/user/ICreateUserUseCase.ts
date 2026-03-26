import type { User } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import type { CreateUserInput } from '@backend/src/infrastructure/validators/userValidator';

export interface ICreateUserUseCase {
    execute(
        input: CreateUserInput,
    ): Promise<
        { success: true; data: User } | { success: false; error: string }
    >;
}
