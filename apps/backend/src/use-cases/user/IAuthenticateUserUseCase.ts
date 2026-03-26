import type { User } from '@backend/src/infrastructure/repositories/user/IUserRepository';
import type { AuthenticateUserInput } from './AuthenticateUserUseCase';

type UserWithoutPassword = Omit<User, 'password'>;

export interface IAuthenticateUserUseCase {
    execute(
        input: AuthenticateUserInput,
    ): Promise<
        | { success: true; data: UserWithoutPassword }
        | { success: false; error: string }
    >;
}
