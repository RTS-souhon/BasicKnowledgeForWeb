export type EmailTemplateType = 'email_verification' | 'login_otp';

export type EmailTemplateInput = {
    code: string;
    template: EmailTemplateType;
};

export type RenderedEmail = {
    subject: string;
    text: string;
};

function assertCodeFormat(code: string) {
    if (!/^\d{6}$/.test(code)) {
        throw new Error('code must be 6 digits');
    }
}

export function renderEmailTemplate(input: EmailTemplateInput): RenderedEmail {
    assertCodeFormat(input.code);

    if (input.template === 'email_verification') {
        return {
            subject: 'Verify your email',
            text: `Your verification code is ${input.code}. This code expires in 10 minutes.`,
        };
    }

    return {
        subject: 'Your login OTP',
        text: `Your one-time password is ${input.code}. This code expires in 10 minutes.`,
    };
}
