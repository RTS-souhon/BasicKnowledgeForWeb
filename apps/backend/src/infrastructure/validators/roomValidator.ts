import { z } from 'zod';

const baseRoomSchema = z.object({
    event_id: z.string().uuid(),
    building_name: z.string().min(1).max(255),
    floor: z.string().min(1).max(50),
    room_name: z.string().min(1).max(255),
    pre_day_manager_id: z.string().uuid().nullable().optional(),
    pre_day_purpose: z.string().max(255).nullable().optional(),
    day_manager_id: z.string().uuid(),
    day_purpose: z.string().min(1).max(255),
    notes: z.string().max(2000).nullable().optional(),
});

export const createRoomSchema = baseRoomSchema;

export const updateRoomSchema = baseRoomSchema
    .omit({ event_id: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: '更新項目を1つ以上指定してください',
    });
