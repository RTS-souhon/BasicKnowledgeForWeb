// Cloudflare Workers 型のテスト用スタブ
// @cloudflare/workers-types は本番 tsconfig でのみ使用するため、
// テスト環境では必要最低限の型のみ宣言する

declare interface R2Bucket {
    put(
        key: string,
        value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    ): Promise<void>;
    get(key: string): Promise<unknown>;
    delete(key: string): Promise<void>;
    createPresignedUrl?: (options: {
        method: string;
        key: string;
        expiration: number;
        headers?: Record<string, string>;
    }) => Promise<{
        url: string;
        method: string;
        headers: Headers;
    }>;
}
