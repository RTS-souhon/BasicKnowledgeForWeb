import { describe, expect, it } from '@jest/globals';
import { eventIdHeaderSchema } from '@backend/src/infrastructure/validators/eventIdValidator';

const VALID_UUID = '00000000-0000-4000-8000-000000000001';

describe('eventIdHeaderSchema', () => {
    it('有効な UUID で成功すること', () => {
        const result = eventIdHeaderSchema.safeParse({
            'x-event-id': VALID_UUID,
        });
        expect(result.success).toBe(true);
    });

    it('x-event-id が未指定のとき失敗すること', () => {
        const result = eventIdHeaderSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('x-event-id が空文字のとき失敗すること', () => {
        const result = eventIdHeaderSchema.safeParse({ 'x-event-id': '' });
        expect(result.success).toBe(false);
    });

    it('x-event-id が UUID 形式でないとき失敗すること', () => {
        const result = eventIdHeaderSchema.safeParse({
            'x-event-id': 'not-a-uuid',
        });
        expect(result.success).toBe(false);
    });

    it('x-event-id が数値文字列のとき失敗すること', () => {
        const result = eventIdHeaderSchema.safeParse({ 'x-event-id': '12345' });
        expect(result.success).toBe(false);
    });
});
