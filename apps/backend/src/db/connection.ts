import { drizzle } from 'drizzle-orm/cockroach';
import { users } from './schema';

// Cloudflare WorkersのHyperdrive型をインポート
interface Hyperdrive {
    connectionString: string;
}

export interface Env {
    HYPERDRIVE: Hyperdrive;
}

export function createDatabaseClient(env: Env) {
    return drizzle({
        connection: {
            connectionString: env.HYPERDRIVE.connectionString,
        },
    });
}

// Export the users table for use in other files
export { users };
