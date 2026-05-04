import { handleInternalSend } from '@email-worker/src/index';
import { describe, expect, jest, test } from '@jest/globals';

describe('handleInternalSend', () => {
    test('returns 400 for invalid request body', async () => {
        const request = new Request('https://example.com/internal/email/send', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ template: 'login_otp' }),
        });

        const response = await handleInternalSend(request, {
            EMAIL_FROM: 'noreply@example.com',
            EMAIL: {
                send: jest.fn(async () => undefined),
            },
        });

        expect(response.status).toBe(400);
    });

    test('sends email and returns 200 for valid request', async () => {
        const send = jest.fn(async () => undefined);
        const request = new Request('https://example.com/internal/email/send', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                to: 'user@example.com',
                template: 'email_verification',
                code: '123456',
            }),
        });

        const response = await handleInternalSend(request, {
            EMAIL_FROM: 'noreply@example.com',
            EMAIL: { send },
        });

        expect(response.status).toBe(200);
        expect(send).toHaveBeenCalledTimes(1);
    });
});
