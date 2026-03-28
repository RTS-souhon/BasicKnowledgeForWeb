export type VerifyAccessCodeInput = {
    code: string;
    jwtSecret: string;
};

export type VerifyAccessCodeResult =
    | { success: true; token: string }
    | { success: false; error: string };

export interface IVerifyAccessCodeUseCase {
    execute(input: VerifyAccessCodeInput): Promise<VerifyAccessCodeResult>;
}
