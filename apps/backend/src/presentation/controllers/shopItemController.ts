import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';
import type { IGetShopItemsUseCase } from '@backend/src/use-cases/shop-item/IGetShopItemsUseCase';
import type { Context } from 'hono';

export async function getShopItems(c: Context, useCase: IGetShopItemsUseCase) {
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
