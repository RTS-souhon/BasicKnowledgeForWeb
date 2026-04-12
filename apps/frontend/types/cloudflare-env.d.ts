export {};

declare global {
    interface CloudflareEnv {
        BACKEND?: {
            fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
        };
    }
}
