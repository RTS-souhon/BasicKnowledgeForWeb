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

const accessSchema = z.object({
    code: z.string().min(1, 'アクセスコードを入力してください'),
});

type AccessFormValues = z.infer<typeof accessSchema>;

export default function AccessPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<AccessFormValues>({
        resolver: zodResolver(accessSchema),
    });

    const onSubmit = async (data: AccessFormValues) => {
        setServerError(null);
        const res = await client.api['access-codes'].verify.$post({
            json: { code: data.code },
        });

        if (res.ok) {
            router.push('/');
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
                    <CardTitle>アクセスコード入力</CardTitle>
                    <CardDescription>
                        イベントスタッフ向けサイトにアクセスするには、
                        担当者から受け取ったアクセスコードを入力してください
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
                            <Label htmlFor='code'>アクセスコード</Label>
                            <Input
                                id='code'
                                type='text'
                                placeholder='例: SUMMER2025'
                                autoComplete='off'
                                {...register('code')}
                                aria-invalid={!!errors.code}
                            />
                            {errors.code && (
                                <p className='text-destructive text-xs'>
                                    {errors.code.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='mt-2'
                        >
                            {isSubmitting ? '確認中...' : '入力する'}
                        </Button>
                    </form>

                    <p className='mt-4 text-center text-muted-foreground text-sm'>
                        管理者の方は{' '}
                        <Link href='/login' className='underline'>
                            こちら
                        </Link>
                        からログインしてください
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
