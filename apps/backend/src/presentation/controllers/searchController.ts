import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import { searchQuerySchema } from '@backend/src/infrastructure/validators/searchValidator';
import type { ISearchUseCase } from '@backend/src/use-cases/search/ISearchUseCase';
import type { Context } from 'hono';

export async function searchContent(c: Context, useCase: ISearchUseCase) {
    const headerParsed = eventIdHeaderSchema.safeParse(c.req.header());
    if (!headerParsed.success) {
        return c.json(
            {
                error: 'バリデーションエラー',
                details: headerParsed.error.issues,
            },
            400,
        );
    }

    const queryParsed = searchQuerySchema.safeParse({ q: c.req.query('q') });
    if (!queryParsed.success) {
        return c.json(
            {
                error: 'バリデーションエラー',
                details: queryParsed.error.issues,
            },
            400,
        );
    }

    const keyword = queryParsed.data.q;
    const eventId = headerParsed.data['x-event-id'];

    const result = await useCase.execute(keyword, eventId);
    if (!result.success) {
        return c.json({ error: result.error }, 500);
    }

    return c.json(result.data, 200);
}
