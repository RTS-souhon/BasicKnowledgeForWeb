import { z } from 'zod';

const baseDepartmentSchema = z.object({
    event_id: z.string().uuid(),
    name: z.string().min(1).max(255),
});

export const createDepartmentSchema = baseDepartmentSchema;

export const copyDepartmentsSchema = z.object({
    source_event_id: z.string().uuid(),
});

export const updateDepartmentSchema = baseDepartmentSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
