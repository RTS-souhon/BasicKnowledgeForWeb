import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post('http://localhost:8080/api/users', async ({ request }) => {
        const body = (await request.json()) as {
            name: string;
            email: string;
            password: string;
        };

        // 重複メールエラー: メールフィールドにエラーを表示するケース
        if (body.email === 'test@example.com') {
            return HttpResponse.json(
                { error: 'このメールアドレスは既に使用されています' },
                { status: 400 },
            );
        }

        // サーバーエラー: フォーム上部にグローバルエラーを表示するケース
        if (body.email === 'error@example.com') {
            return HttpResponse.json(
                { error: 'ユーザーの作成に失敗しました' },
                { status: 500 },
            );
        }

        return HttpResponse.json(
            {
                user: {
                    id: 1,
                    name: body.name,
                    email: body.email,
                    role: 'user',
                },
            },
            { status: 201 },
        );
    }),
];
