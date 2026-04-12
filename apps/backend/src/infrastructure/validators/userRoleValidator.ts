import { z } from 'zod';

export const updateUserRoleSchema = z.object({
    role: z.enum(['user', 'admin']),
});

export type UpdateUserRoleBody = z.infer<typeof updateUserRoleSchema>;
