import { describe, expect, it } from '@jest/globals';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';

describe('createIlikePattern', () => {
    it('wraps keyword with % for partial match', () => {
        expect(createIlikePattern('keyword')).toBe('%keyword%');
    });

    it('escapes SQL wildcard characters', () => {
        const result = createIlikePattern('%foo_bar%');
        expect(result).toBe('%\\%foo\\_bar\\%%');
    });

    it('escapes backslashes to avoid breaking escape sequence', () => {
        const result = createIlikePattern('folder\\name');
        expect(result).toBe('%folder\\\\name%');
    });
});
