import type { UserPublic } from '@backend/src/infrastructure/repositories/user/IUserRepository';

export interface IGetUsersUseCase {
    execute(): Promise<
        | { success: true; data: UserPublic[] }
        | { success: false; error: string }
    >;
}
