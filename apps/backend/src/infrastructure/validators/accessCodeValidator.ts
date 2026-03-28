import { z } from 'zod';

export const verifyAccessCodeSchema = z.object({
    code: z.string().min(1).max(50),
});

export const createAccessCodeSchema = z.object({
    code: z.string().min(1).max(50),
    eventName: z.string().min(1).max(255),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime(),
});
