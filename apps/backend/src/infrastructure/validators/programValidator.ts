import { z } from 'zod';

const baseProgramSchema = z.object({
    event_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    location: z.string().min(1).max(255),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    description: z.string().max(2000).nullable().optional(),
});

export const createProgramSchema = baseProgramSchema;

export const updateProgramSchema = baseProgramSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
