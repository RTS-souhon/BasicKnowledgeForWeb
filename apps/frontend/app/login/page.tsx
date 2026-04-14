'use client';

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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.email('有効なメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError(null);
        const res = await client.api.auth.login.$post({ json: data });

        if (res.ok) {
            router.push('/dashboard');
            return;
        }

        const body = await res.json();
        if ('error' in body) {
            setServerError(body.error);
        }
    };

    return (
        <div className='flex min-h-screen items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle>ログイン</CardTitle>
                    <CardDescription>
                        管理者の方はこちらからログインしてください
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='flex flex-col gap-4'
                    >
                        {serverError && (
                            <p
                                className='text-destructive text-sm'
                                role='alert'
                            >
                                {serverError}
                            </p>
                        )}

                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='email'>メールアドレス</Label>
                            <Input
                                id='email'
                                type='email'
                                autoComplete='email'
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
                                autoComplete='current-password'
                                {...register('password')}
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && (
                                <p className='text-destructive text-xs'>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='mt-2'
                        >
                            {isSubmitting ? 'ログイン中...' : 'ログイン'}
                        </Button>
                    </form>

                    <p className='mt-4 text-center text-muted-foreground text-sm'>
                        アカウントをお持ちでない方は{' '}
                        <Link href='/register' className='underline'>
                            こちら
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
