export interface UpdateUserRoleInput {
    id: string;
    role: string;
}

export type UpdateUserRoleResult =
    | { success: true }
    | { success: false; error: string; status: number };

export interface IUpdateUserRoleUseCase {
    execute(input: UpdateUserRoleInput): Promise<UpdateUserRoleResult>;
}
