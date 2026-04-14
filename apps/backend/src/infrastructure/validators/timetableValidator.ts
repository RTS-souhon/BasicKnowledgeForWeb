import { z } from 'zod';

const baseTimetableSchema = z.object({
    event_id: z.string().uuid(),
    title: z.string().min(1).max(255),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    location: z.string().min(1).max(255),
    description: z.string().max(2000).nullable().optional(),
});

export const createTimetableItemSchema = baseTimetableSchema;

export const updateTimetableItemSchema = baseTimetableSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
