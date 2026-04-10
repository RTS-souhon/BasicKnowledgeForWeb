import { drizzle } from 'drizzle-orm/cockroach';
import { accessCodes, users } from './schema';

// Cloudflare WorkersのHyperdrive型をインポート
interface Hyperdrive {
    connectionString: string;
}

export interface Env {
    HYPERDRIVE: Hyperdrive;
    JWT_SECRET: string;
    SHOP_ITEM_ASSET_BUCKET: R2Bucket;
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
