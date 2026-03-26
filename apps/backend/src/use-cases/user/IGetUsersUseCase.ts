import type { User } from '@backend/src/infrastructure/repositories/user/IUserRepository';

export interface IGetUsersUseCase {
    execute(): Promise<
        { success: true; data: User[] } | { success: false; error: string }
    >;
}
