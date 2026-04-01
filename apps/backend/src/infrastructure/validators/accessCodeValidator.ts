import { z } from 'zod';

export const verifyAccessCodeSchema = z.object({
    code: z.string().min(1).max(50),
});

export const createAccessCodeSchema = z
    .object({
        code: z.string().min(1).max(50),
        eventName: z.string().min(1).max(255),
        validFrom: z.string().datetime(),
        validTo: z.string().datetime(),
    })
    .refine((data) => new Date(data.validTo) > new Date(data.validFrom), {
        message: '有効終了日は開始日より後にしてください',
        path: ['validTo'],
    });
