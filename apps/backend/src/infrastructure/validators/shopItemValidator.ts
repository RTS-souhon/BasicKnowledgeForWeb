import { z } from 'zod';

const baseShopItemSchema = z.object({
    event_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    price: z.number().int().min(0),
    description: z.string().max(2000).nullable().optional(),
    image_key: z.string().min(1).max(512),
});

export const createShopItemSchema = baseShopItemSchema;

export const updateShopItemSchema = baseShopItemSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });

export const createShopItemUploadUrlSchema = z
    .object({
        file_name: z.string().min(1).max(255).optional(),
        content_type: z.string().min(1).max(255).optional(),
    })
    .optional()
    .default({});
