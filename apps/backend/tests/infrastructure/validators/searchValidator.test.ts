import { describe, expect, it } from '@jest/globals';
import { searchQuerySchema } from '@backend/src/infrastructure/validators/searchValidator';

describe('searchQuerySchema', () => {
    it('passes when q has at least 1 non-space character', () => {
        const result = searchQuerySchema.safeParse({ q: '  room ' });
        expect(result.success).toBe(true);
        expect(result.success && result.data.q).toBe('room');
    });

    it('fails when q is empty', () => {
        const result = searchQuerySchema.safeParse({ q: '   ' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe(
                '検索キーワードは1文字以上で入力してください',
            );
        }
    });

    it('fails when q is missing', () => {
        const result = searchQuerySchema.safeParse({});
        expect(result.success).toBe(false);
    });
});
