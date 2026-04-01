export type LoginInput = {
    email: string;
    password: string;
    jwtSecret: string;
};

export type LoginSuccess = {
    success: true;
    token: string;
};

export type LoginFailure = {
    success: false;
    error: string;
};

export type LoginResult = LoginSuccess | LoginFailure;

export interface ILoginUseCase {
    execute(input: LoginInput): Promise<LoginResult>;
}
