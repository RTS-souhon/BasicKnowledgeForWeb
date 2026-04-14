export type ChangePasswordInput = {
    userId: string;
    currentPassword: string;
    newPassword: string;
};

export type ChangePasswordResult =
    | { success: true }
    | { success: false; error: string; status: number };

export interface IChangePasswordUseCase {
    execute(input: ChangePasswordInput): Promise<ChangePasswordResult>;
}
