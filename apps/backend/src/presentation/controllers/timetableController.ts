import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import type { IGetTimetableItemsUseCase } from '@backend/src/use-cases/timetable/IGetTimetableItemsUseCase';
import type { Context } from 'hono';

export async function getTimetableItems(
    c: Context,
    useCase: IGetTimetableItemsUseCase,
) {
    const parsed = eventIdHeaderSchema.safeParse(c.req.header());
    if (!parsed.success) {
        return c.json(
            { error: 'バリデーションエラー', details: parsed.error.issues },
            400,
        );
    }

    const result = await useCase.execute(parsed.data['x-event-id']);
    if (!result.success) {
        return c.json({ error: result.error }, 500);
    }
    return c.json({ items: result.data }, 200);
}
