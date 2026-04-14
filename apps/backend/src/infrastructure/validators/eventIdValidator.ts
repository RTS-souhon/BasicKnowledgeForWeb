import { z } from 'zod';

export const eventIdHeaderSchema = z.object({
    'x-event-id': z
        .string()
        .uuid({ message: 'x-event-id は有効な UUID である必要があります' }),
});
