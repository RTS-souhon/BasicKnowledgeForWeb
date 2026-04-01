import { describe, expect, it } from '@jest/globals';
import {
    createAccessCodeSchema,
    verifyAccessCodeSchema,
} from '@backend/src/infrastructure/validators/accessCodeValidator';

describe('verifyAccessCodeSchema', () => {
    it('正常なアクセスコードを受け付ける', () => {
        const result = verifyAccessCodeSchema.safeParse({ code: 'SUMMER2025' });
        expect(result.success).toBe(true);
    });

    it('空文字のアクセスコードを弾く', () => {
        const result = verifyAccessCodeSchema.safeParse({ code: '' });
        expect(result.success).toBe(false);
    });
});

describe('createAccessCodeSchema', () => {
    const validInput = {
        code: 'SUMMER2025',
        eventName: '2025夏イベント',
        validFrom: '2025-07-01T00:00:00.000Z',
        validTo: '2025-07-31T23:59:59.000Z',
    };

    it('正常な入力を受け付ける', () => {
        const result = createAccessCodeSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    it('終了日が開始日以前の場合はエラーになる', () => {
        const result = createAccessCodeSchema.safeParse({
            ...validInput,
            validTo: validInput.validFrom,
        });

        expect(result.success).toBe(false);
    });
});
