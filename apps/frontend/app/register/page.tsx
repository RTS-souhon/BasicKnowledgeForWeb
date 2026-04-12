'use client';

import { createUserSchema } from '@backend/src/infrastructure/validators/userValidator';
import { client } from '@frontend/app/utils/client';
import { Button } from '@frontend/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@frontend/components/ui/card';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// バックエンドのスキーマを拡張してパスワード確認フィールドを追加
const registerSchema = createUserSchema
    .extend({ confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'パスワードが一致しません',
        path: ['confirmPassword'],
    });

// z.infer はデフォルト適用後の出力型、z.input はフォーム入力の型
type RegisterFormValues = z.input<typeof registerSchema>;

export default function RegisterPage() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    /**
     * フォーム送信ハンドラ
     *
     * ここに API 呼び出しとエラーハンドリングを実装してください。
     *
     * 利用可能なもの:
     * - client.api.users.$post({ json: { name, email, password } })
     *   成功時 201: { user: { id, name, email, ... } }
     *   重複時 400: { error: "このメールアドレスは既に使用されています" }
     *   検証時 400: { error: "バリデーションエラー", details: [...] }
     *   障害時 500: { error: "ユーザーの作成に失敗しました" }
     *
     * - setSuccessMessage(msg) .... 成功メッセージを表示してフォームを切り替える
     * - setServerError(msg) ....... フォーム上部にグローバルエラーを表示する
     * - setError('email', { message }) ... メールフィールドにエラーをセットする
     * - reset() ................... フォームの値をリセットする
     */
    const onSubmit = async (data: RegisterFormValues) => {
        setServerError(null);
        const res = await client.api.users.$post({
            json: {
                name: data.name,
                email: data.email,
                password: data.password,
            },
        });
        const body = await res.json();

        if (res.ok) {
            reset();
            setSuccessMessage('登録が完了しました！');
            return;
        }

        if ('error' in body) {
            if (body.error === 'このメールアドレスは既に使用されています') {
                setError('email', { message: body.error });
            } else {
                setServerError(body.error);
            }
        }
    };

    if (successMessage) {
        return (
            <div className='flex min-h-screen items-center justify-center p-4'>
                <Card className='w-full max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <p className='text-green-600'>{successMessage}</p>
                        <Link
                            href='/login'
                            className='mt-4 inline-flex items-center justify-center text-primary underline'
                        >
                            ログインページへ移動する
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle>ユーザー登録</CardTitle>
                    <CardDescription>
                        アカウントを作成してください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-4'
                    >
                        {serverError && (
                            <p className='text-destructive text-sm'>
                                {serverError}
                            </p>
                        )}

                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='name'>名前</Label>
                            <Input
                                id='name'
                                {...register('name')}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className='text-destructive text-xs'>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='email'>メールアドレス</Label>
                            <Input
                                id='email'
                                type='email'
                                {...register('email')}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className='text-destructive text-xs'>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='password'>パスワード</Label>
                            <Input
                                id='password'
                                type='password'
                                {...register('password')}
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && (
                                <p className='text-destructive text-xs'>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='confirmPassword'>
                                パスワード（確認用）
                            </Label>
                            <Input
                                id='confirmPassword'
                                type='password'
                                {...register('confirmPassword')}
                                aria-invalid={!!errors.confirmPassword}
                            />
                            {errors.confirmPassword && (
                                <p className='text-destructive text-xs'>
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='mt-2'
                        >
                            {isSubmitting ? '登録中...' : '登録する'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
