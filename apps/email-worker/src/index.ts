import {
    type EmailTemplateType,
    renderEmailTemplate,
} from '@email-worker/src/emailTemplates';

type SendEmailMessage = {
    from: string;
    subject: string;
    text: string;
    to: string;
};

type SendEmailBinding = {
    send(message: SendEmailMessage): Promise<void>;
};

type Env = {
    EMAIL: SendEmailBinding;
    EMAIL_FROM: string;
};

type SendEmailRequestBody = {
    code: string;
    template: EmailTemplateType;
    to: string;
};

function badRequest(message: string) {
    return Response.json({ error: message }, { status: 400 });
}

async function parseBody(
    request: Request,
): Promise<SendEmailRequestBody | null> {
    const body = (await request
        .json()
        .catch(() => null)) as Partial<SendEmailRequestBody> | null;

    if (!body) {
        return null;
    }

    if (
        typeof body.to !== 'string' ||
        typeof body.code !== 'string' ||
        (body.template !== 'email_verification' &&
            body.template !== 'login_otp')
    ) {
        return null;
    }

    return {
        to: body.to,
        code: body.code,
        template: body.template,
    };
}

export async function handleInternalSend(request: Request, env: Env) {
    const payload = await parseBody(request);
    if (!payload) {
        return badRequest('invalid request body');
    }

    const rendered = renderEmailTemplate(payload);
    await env.EMAIL.send({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: rendered.subject,
        text: rendered.text,
    });

    return Response.json({ ok: true }, { status: 200 });
}

type WorkerEntrypoint = {
    fetch(request: Request, env: Env): Promise<Response>;
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (
            request.method === 'POST' &&
            url.pathname === '/internal/email/send'
        ) {
            return handleInternalSend(request, env);
        }

        return Response.json({ error: 'not found' }, { status: 404 });
    },
} satisfies WorkerEntrypoint;
