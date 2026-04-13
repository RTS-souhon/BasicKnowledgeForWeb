'use client';

import { updateUserRoleAction } from '@frontend/app/actions/dashboard';
import { useEffect, useState, useTransition } from 'react';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
};

type Props = {
    initialUsers: User[];
};

const ROLE_LABELS: Record<string, string> = {
    user: 'スタッフ',
    admin: '管理者',
};

export default function UserRolePanel({ initialUsers }: Props) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<
        Record<string, 'user' | 'admin'>
    >(
        Object.fromEntries(
            initialUsers.map((u) => [u.id, u.role]),
        ) as Record<string, 'user' | 'admin'>,
    );
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    useEffect(() => {
        setUsers(initialUsers);
        setSelectedRoles(
            Object.fromEntries(
                initialUsers.map((u) => [u.id, u.role]),
            ) as Record<string, 'user' | 'admin'>,
        );
    }, [initialUsers]);

    const handleRoleChange = (userId: string) => {
        const newRole = selectedRoles[userId];
        if (!newRole) return;

        setError(null);
        setPendingId(userId);
        setInfoMessage(null);

        startTransition(async () => {
            const result = await updateUserRoleAction(userId, newRole);
            setPendingId(null);
            if (!result.success) {
                setError(result.error);
                const actualRole = users.find((u) => u.id === userId)?.role as
                    | 'user'
                    | 'admin'
                    | undefined;
                if (actualRole) {
                    setSelectedRoles((prev) => ({
                        ...prev,
                        [userId]: actualRole,
                    }));
                }
            } else {
                setUsers(result.data);
                setSelectedRoles(
                    Object.fromEntries(
                        result.data.map((u) => [u.id, u.role]),
                    ) as Record<string, 'user' | 'admin'>,
                );
                setInfoMessage('ユーザーのロールを更新しました');
            }
        });
    };

    return (
        <section aria-labelledby='user-management-heading'>
            <h2
                id='user-management-heading'
                className='mb-4 font-semibold text-foreground text-lg'
            >
                ユーザー管理
            </h2>
            {infoMessage && (
                <p
                    role='status'
                    className='mb-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 text-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                >
                    {infoMessage}
                </p>
            )}
            {error && (
                <p role='alert' className='mb-3 text-destructive text-sm'>
                    {error}
                </p>
            )}

            {/* Desktop table */}
            <div className='hidden overflow-hidden rounded-lg border border-border md:block'>
                <table className='w-full text-sm' aria-label='ユーザー一覧'>
                    <thead className='bg-muted/50'>
                        <tr>
                            <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                名前
                            </th>
                            <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                メール
                            </th>
                            <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                ロール
                            </th>
                            <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-border bg-card'>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className='px-4 py-3 text-foreground'>
                                    {user.name}
                                </td>
                                <td className='break-all px-4 py-3 text-muted-foreground'>
                                    {user.email}
                                </td>
                                <td className='px-4 py-3'>
                                    <select
                                        aria-label={`${user.name}のロール`}
                                        value={selectedRoles[user.id]}
                                        onChange={(e) =>
                                            setSelectedRoles((prev) => ({
                                                ...prev,
                                                [user.id]: e.target.value as
                                                    | 'user'
                                                    | 'admin',
                                            }))
                                        }
                                        className='rounded border border-input bg-background px-2 py-1 text-sm'
                                    >
                                        <option value='user'>スタッフ</option>
                                        <option value='admin'>管理者</option>
                                    </select>
                                </td>
                                <td className='px-4 py-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            handleRoleChange(user.id)
                                        }
                                        disabled={pendingId === user.id}
                                        className='rounded bg-primary px-3 py-1 font-medium text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50'
                                    >
                                        変更
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className='space-y-3 md:hidden'>
                {users.map((user) => (
                    <div
                        key={user.id}
                        className='rounded-lg border border-border bg-card p-4'
                    >
                        <p className='font-medium text-foreground'>
                            {user.name}
                        </p>
                        <p className='mt-1 break-all text-muted-foreground text-sm'>
                            {user.email}
                        </p>
                        <div className='mt-3 flex items-center gap-2'>
                            <select
                                aria-label={`${user.name}のロール`}
                                value={selectedRoles[user.id]}
                                onChange={(e) =>
                                    setSelectedRoles((prev) => ({
                                        ...prev,
                                        [user.id]: e.target.value as
                                            | 'user'
                                            | 'admin',
                                    }))
                                }
                                className='flex-1 rounded border border-input bg-background px-2 py-1 text-sm'
                            >
                                <option value='user'>スタッフ</option>
                                <option value='admin'>管理者</option>
                            </select>
                            <button
                                type='button'
                                onClick={() => handleRoleChange(user.id)}
                                disabled={pendingId === user.id}
                                className='rounded bg-primary px-3 py-1 font-medium text-primary-foreground text-xs hover:bg-primary/90 disabled:opacity-50'
                            >
                                変更
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <p className='text-muted-foreground text-sm'>
                    登録されているユーザーはありません
                </p>
            )}

            {/* Current role display for reference */}
            <div className='mt-4 hidden'>
                {users.map((u) => (
                    <span key={u.id} data-testid={`role-${u.id}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                ))}
            </div>
        </section>
    );
}
