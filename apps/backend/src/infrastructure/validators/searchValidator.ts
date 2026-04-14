import { z } from 'zod';

export const searchQuerySchema = z.object({
    q: z.string().trim().min(1, '検索キーワードは1文字以上で入力してください'),
});
