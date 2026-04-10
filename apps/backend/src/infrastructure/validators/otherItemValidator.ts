import { z } from 'zod';

const baseOtherItemSchema = z.object({
    event_id: z.string().uuid(),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    display_order: z.number().int().nonnegative(),
});

export const createOtherItemSchema = baseOtherItemSchema;

export const updateOtherItemSchema = baseOtherItemSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
