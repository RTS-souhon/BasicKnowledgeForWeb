import type { Context } from 'hono';
import type { ICheckDatabaseHealthUseCase } from '@/use-cases/health/ICheckDatabaseHealthUseCase';

export async function checkHealth(
    c: Context,
    useCase: ICheckDatabaseHealthUseCase,
) {
    const result = await useCase.execute();

    if (!result.success) {
        return c.json({ status: 'error', db: 'disconnected' }, 503);
    }

    return c.json({ status: 'ok', db: 'connected' });
}
