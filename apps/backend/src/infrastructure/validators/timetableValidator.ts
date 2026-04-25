import { z } from 'zod';

const titleSchema = z.string().min(1).max(255);
const startTimeSchema = z.string().datetime();
const locationSchema = z.string().max(255);
const descriptionSchema = z.string().max(2000).nullable().optional();

export const createTimetableItemSchema = z.object({
    event_id: z.string().uuid(),
    title: titleSchema,
    start_time: startTimeSchema,
    location: locationSchema.optional().default(''),
    description: descriptionSchema,
});

export const updateTimetableItemSchema = z
    .object({
        title: titleSchema.optional(),
        start_time: startTimeSchema.optional(),
        location: locationSchema.optional(),
        description: descriptionSchema,
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
