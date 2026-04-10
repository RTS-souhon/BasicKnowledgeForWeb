import { drizzle } from 'drizzle-orm/cockroach';
import { accessCodes, users } from './schema';

interface Hyperdrive {
    connectionString: string;
}

export interface R2Bucket {
    put(
        key: string,
        value:
            | ReadableStream
            | ArrayBuffer
            | ArrayBufferView
            | string
            | null
            | Blob,
        options?: object,
    ): Promise<object>;
    get(key: string): Promise<unknown>;
    delete(key: string): Promise<void>;
}

export interface Env {
    HYPERDRIVE: Hyperdrive;
    JWT_SECRET: string;
    SHOP_ITEM_ASSET_BUCKET: R2Bucket;
    SHOP_ITEM_ASSET_BASE_URL: string;
}

export function createDatabaseClient(env: Env) {
    return drizzle({
        connection: {
            connectionString: env.HYPERDRIVE.connectionString,
        },
    });
}

// Export tables for use in other files
export { accessCodes, users };
