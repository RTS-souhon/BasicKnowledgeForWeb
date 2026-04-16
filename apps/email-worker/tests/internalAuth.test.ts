import {
    getBearerToken,
    isAuthorizedRequest,
} from '@email-worker/src/internalAuth';
import { describe, expect, test } from '@jest/globals';

describe('internalAuth', () => {
    test('extracts bearer token', () => {
        expect(getBearerToken('Bearer token-value')).toBe('token-value');
    });

    test('returns null for invalid scheme', () => {
        expect(getBearerToken('Basic token-value')).toBeNull();
    });

    test('authorizes matching token', () => {
        expect(isAuthorizedRequest('Bearer expected', 'expected')).toBe(true);
    });

    test('rejects mismatched token', () => {
        expect(isAuthorizedRequest('Bearer unexpected', 'expected')).toBe(
            false,
        );
    });
});
