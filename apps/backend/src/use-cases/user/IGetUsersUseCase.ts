import type { User } from '@/infrastructure/repositories/user/IUserRepository';

export interface IGetUsersUseCase {
    execute(): Promise<
        { success: true; data: User[] } | { success: false; error: string }
    >;
}
