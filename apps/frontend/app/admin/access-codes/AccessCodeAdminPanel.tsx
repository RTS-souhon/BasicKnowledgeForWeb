'use client';

import {
    createAccessCodeAction,
    deleteAccessCodeAction,
} from '@frontend/app/actions/access-codes';
import { useState, useTransition } from 'react';

type AccessCode = {
    id: string;
    code: string;
    eventName: string;
    validFrom: string;
    validTo: string;
};

type Props = {
    codes: AccessCode[];
};

function getStatus(validFrom: string, validTo: string) {
    const now = Date.now();
    const from = new Date(validFrom).getTime();
    const to = new Date(validTo).getTime();
    if (now < from) return 'upcoming' as const;
    if (now > to) return 'expired' as const;
    return 'active' as const;
}

const STATUS_LABELS = {
    active: '有効中',
    expired: '終了',
    upcoming: '準備中',
} as const;

const STATUS_CLASSES = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    expired: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    upcoming:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
} as const;

function formatDateRange(validFrom: string, validTo: string): string {
    const fmt = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };
    return `${fmt(validFrom)} 〜 ${fmt(validTo)}`;
}

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
}

export default function AccessCodeAdminPanel({ codes }: Props) {
    const [eventName, setEventName] = useState('');
    const [code, setCode] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        setFormError(null);

        if (!eventName.trim() || !code.trim() || !validFrom || !validTo) {
            setFormError('すべての項目を入力してください');
            return;
        }
        if (new Date(validTo) <= new Date(validFrom)) {
            setFormError('有効終了日は開始日より後にしてください');
            return;
        }

        startTransition(async () => {
            const result = await createAccessCodeAction({
                code: code.trim(),
                eventName: eventName.trim(),
                validFrom: new Date(validFrom).toISOString(),
                validTo: new Date(validTo).toISOString(),
            });
            if (!result.success) {
                setFormError(result.error);
            } else {
                setEventName('');
                setCode('');
                setValidFrom('');
                setValidTo('');
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('このアクセスコードを削除しますか？')) return;

        setGlobalError(null);
        startTransition(async () => {
            const result = await deleteAccessCodeAction(id);
            if (!result.success) {
                setGlobalError(result.error);
            }
        });
    };

    return (
        <div className='space-y-8'>
            <h1 className='font-bold text-2xl text-foreground'>
                アクセスコード管理
            </h1>

            {/* 新規コード生成フォーム */}
            <section aria-labelledby='create-heading'>
                <h2
                    id='create-heading'
                    className='mb-4 font-semibold text-foreground text-lg'
                >
                    新規コード生成
                </h2>
                <div className='rounded-lg border border-border bg-card p-6'>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='eventName'
                                className='mb-1 block font-medium text-foreground text-sm'
                            >
                                イベント名
                            </label>
                            <input
                                id='eventName'
                                type='text'
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                placeholder='2025夏イベント'
                            />
                        </div>
                        <div>
                            <label
                                htmlFor='code'
                                className='mb-1 block font-medium text-foreground text-sm'
                            >
                                コード
                            </label>
                            <div className='flex gap-2'>
                                <input
                                    id='code'
                                    type='text'
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value.toUpperCase())
                                    }
                                    className='flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    placeholder='SUMMER25'
                                />
                                <button
                                    type='button'
                                    onClick={() => setCode(generateCode())}
                                    className='rounded-md border border-input bg-muted px-3 py-2 text-muted-foreground text-sm hover:bg-muted/80'
                                >
                                    自動
                                </button>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <div>
                                <label
                                    htmlFor='validFrom'
                                    className='mb-1 block font-medium text-foreground text-sm'
                                >
                                    有効開始日
                                </label>
                                <input
                                    id='validFrom'
                                    type='date'
                                    value={validFrom}
                                    onChange={(e) =>
                                        setValidFrom(e.target.value)
                                    }
                                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor='validTo'
                                    className='mb-1 block font-medium text-foreground text-sm'
                                >
                                    有効終了日
                                </label>
                                <input
                                    id='validTo'
                                    type='date'
                                    value={validTo}
                                    onChange={(e) => setValidTo(e.target.value)}
                                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                />
                            </div>
                        </div>

                        {formError && (
                            <p
                                role='alert'
                                className='text-destructive text-sm'
                            >
                                {formError}
                            </p>
                        )}

                        <button
                            type='button'
                            onClick={handleCreate}
                            disabled={isPending}
                            className='rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:opacity-50'
                        >
                            {isPending ? '生成中...' : '生成する'}
                        </button>
                    </div>
                </div>
            </section>

            {/* コード一覧 */}
            <section aria-labelledby='list-heading'>
                <h2
                    id='list-heading'
                    className='mb-4 font-semibold text-foreground text-lg'
                >
                    現在のコード一覧
                </h2>

                {globalError && (
                    <p role='alert' className='mb-3 text-destructive text-sm'>
                        {globalError}
                    </p>
                )}

                {codes.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>
                        登録されているコードはありません
                    </p>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className='hidden overflow-hidden rounded-lg border border-border md:block'>
                            <table
                                className='w-full text-sm'
                                aria-label='アクセスコード一覧'
                            >
                                <thead className='bg-muted/50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                            イベント名
                                        </th>
                                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                            コード
                                        </th>
                                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                            有効期間
                                        </th>
                                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                            ステータス
                                        </th>
                                        <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                            操作
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-border bg-card'>
                                    {codes.map((c) => {
                                        const status = getStatus(
                                            c.validFrom,
                                            c.validTo,
                                        );
                                        return (
                                            <tr key={c.id}>
                                                <td className='px-4 py-3 text-foreground'>
                                                    {c.eventName}
                                                </td>
                                                <td className='px-4 py-3 font-mono font-semibold text-foreground'>
                                                    {c.code}
                                                </td>
                                                <td className='px-4 py-3 text-muted-foreground'>
                                                    {formatDateRange(
                                                        c.validFrom,
                                                        c.validTo,
                                                    )}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${STATUS_CLASSES[status]}`}
                                                    >
                                                        {STATUS_LABELS[status]}
                                                    </span>
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            handleDelete(c.id)
                                                        }
                                                        disabled={isPending}
                                                        className='rounded bg-destructive px-3 py-1 font-medium text-destructive-foreground text-xs hover:bg-destructive/90 disabled:opacity-50'
                                                    >
                                                        削除
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className='space-y-3 md:hidden'>
                            {codes.map((c) => {
                                const status = getStatus(
                                    c.validFrom,
                                    c.validTo,
                                );
                                return (
                                    <div
                                        key={c.id}
                                        className='rounded-lg border border-border bg-card p-4'
                                    >
                                        <p className='font-medium text-foreground'>
                                            {c.eventName}
                                        </p>
                                        <p className='mt-1 font-mono font-semibold text-foreground text-lg'>
                                            {c.code}
                                        </p>
                                        <p className='mt-1 text-muted-foreground text-sm'>
                                            {formatDateRange(
                                                c.validFrom,
                                                c.validTo,
                                            )}
                                        </p>
                                        <div className='mt-3 flex items-center justify-between'>
                                            <span
                                                className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${STATUS_CLASSES[status]}`}
                                            >
                                                {STATUS_LABELS[status]}
                                            </span>
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    handleDelete(c.id)
                                                }
                                                disabled={isPending}
                                                className='rounded bg-destructive px-3 py-1 font-medium text-destructive-foreground text-xs hover:bg-destructive/90 disabled:opacity-50'
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
