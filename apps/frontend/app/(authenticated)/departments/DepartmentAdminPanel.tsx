'use client';

import {
    createDepartmentAction,
    deleteDepartmentAction,
    updateDepartmentAction,
} from '@frontend/app/actions/departments';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type Department = {
    id: string;
    name: string;
};

type Props = { departments: Department[]; eventId: string };

export default function DepartmentAdminPanel({ departments, eventId }: Props) {
    const router = useRouter();
    const [formMode, setFormMode] = useState<'idle' | 'adding' | 'editing'>(
        'idle',
    );
    const [editingItem, setEditingItem] = useState<Department | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const openAdd = () => {
        setName('');
        setEditingItem(null);
        setError(null);
        setInfoMessage(null);
        setFormMode('adding');
    };

    const openEdit = (item: Department) => {
        setName(item.name);
        setEditingItem(item);
        setError(null);
        setInfoMessage(null);
        setFormMode('editing');
    };

    const closeForm = () => {
        setFormMode('idle');
        setEditingItem(null);
        setError(null);
    };

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('部署名は必須です');
            return;
        }

        startTransition(async () => {
            const result =
                formMode === 'editing' && editingItem
                    ? await updateDepartmentAction(eventId, editingItem.id, {
                          name: trimmed,
                      })
                    : await createDepartmentAction(eventId, { name: trimmed });

            if (!result.success) {
                setError(result.error);
                return;
            }

            setInfoMessage(
                formMode === 'adding'
                    ? '部署を追加しました'
                    : '部署を更新しました',
            );
            closeForm();
            router.refresh();
        });
    };

    const handleDelete = (item: Department) => {
        if (!confirm(`「${item.name}」を削除しますか？`)) return;
        startTransition(async () => {
            const result = await deleteDepartmentAction(eventId, item.id);
            if (!result.success) {
                setError(result.error);
                return;
            }
            setInfoMessage('部署を削除しました');
            router.refresh();
        });
    };

    return (
        <section aria-labelledby='departments-heading'>
            <div className='mb-6 flex items-center justify-between'>
                <div>
                    <h1
                        id='departments-heading'
                        className='font-semibold text-foreground text-xl tracking-tight'
                    >
                        部署管理
                    </h1>
                    <p className='mt-2 text-muted-foreground text-sm'>
                        イベントに参加する部署を管理します。
                    </p>
                </div>
                {formMode === 'idle' && (
                    <Button size='sm' onClick={openAdd}>
                        + 追加
                    </Button>
                )}
            </div>

            {infoMessage && (
                <p
                    role='status'
                    className='mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                >
                    {infoMessage}
                </p>
            )}

            {error && (
                <p
                    role='alert'
                    className='mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-700 text-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-400'
                >
                    {error}
                </p>
            )}

            {formMode !== 'idle' && (
                <div className='mb-6 rounded-xl border border-border bg-card p-4 shadow-sm'>
                    <h2 className='mb-4 font-medium text-foreground text-sm'>
                        {formMode === 'adding'
                            ? '新しい部署を追加'
                            : '部署を編集'}
                    </h2>
                    <div>
                        <Label htmlFor='department-name'>
                            部署名
                            <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Input
                            id='department-name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='例: 企画部'
                            className='mt-1'
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit();
                            }}
                        />
                    </div>
                    <div className='mt-4 flex gap-2'>
                        <Button
                            size='sm'
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? '保存中...' : '保存'}
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={closeForm}
                            disabled={isPending}
                        >
                            キャンセル
                        </Button>
                    </div>
                </div>
            )}

            {departments.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されている部署はありません
                </p>
            ) : (
                <div className='space-y-2'>
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className='flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm'
                        >
                            <span className='font-medium text-foreground text-sm'>
                                {dept.name}
                            </span>
                            <div className='flex shrink-0 gap-1'>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => openEdit(dept)}
                                    disabled={isPending}
                                >
                                    編集
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => handleDelete(dept)}
                                    disabled={isPending}
                                    className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40'
                                >
                                    削除
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
