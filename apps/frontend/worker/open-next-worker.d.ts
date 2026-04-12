declare module '../.open-next/worker.js' {
    import type { ExecutionContext } from '@cloudflare/workers-types';
    import type { Env } from './types';

    interface OpenNextWorkerModule {
        fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
    }

    const worker: OpenNextWorkerModule;
    export default worker;
}
