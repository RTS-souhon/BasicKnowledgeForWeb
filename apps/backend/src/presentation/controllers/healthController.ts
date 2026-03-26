import type { ICheckDatabaseHealthUseCase } from '@backend/src/use-cases/health/ICheckDatabaseHealthUseCase';
import type { Context } from 'hono';

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
