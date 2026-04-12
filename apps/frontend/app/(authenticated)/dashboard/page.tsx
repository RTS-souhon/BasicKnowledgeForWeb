import { resolveAuth } from '@frontend/app/lib/serverAuth';
import { redirect } from 'next/navigation';
import PasswordChangeForm from './PasswordChangeForm';
import UserRolePanel from './UserRolePanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type Me = { id: string; name: string; email: string; role: string };
type UserEntry = { id: string; name: string; email: string; role: string };

const ROLE_LABELS: Record<string, string> = {
    user: 'スタッフ',
    admin: '管理者',
};

async function fetchMe(authToken: string): Promise<Me | null> {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Cookie: `auth_token=${authToken}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return (await res.json()) as Me;
    } catch {
        return null;
    }
}

async function fetchUsers(authToken: string): Promise<UserEntry[]> {
    try {
        const res = await fetch(`${API_URL}/api/users`, {
            headers: { Cookie: `auth_token=${authToken}` },
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { users: UserEntry[] };
        return data.users ?? [];
    } catch {
        return [];
    }
}

export default async function DashboardPage() {
    const { authToken, role } = await resolveAuth();

    if (!authToken) {
        redirect('/login');
    }

    const me = await fetchMe(authToken);
    if (!me) {
        redirect('/login');
    }

    const isAdmin = role === 'admin';
    const users = isAdmin ? await fetchUsers(authToken) : [];

    return (
        <div className='space-y-8'>
            <h1 className='font-bold text-2xl text-foreground'>
                ダッシュボード
            </h1>

            {/* プロフィール */}
            <section aria-labelledby='profile-heading'>
                <h2
                    id='profile-heading'
                    className='mb-4 font-semibold text-foreground text-lg'
                >
                    プロフィール
                </h2>
                <div className='rounded-lg border border-border bg-card p-6'>
                    <dl className='space-y-3 text-sm'>
                        <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
                            <dt className='w-24 font-medium text-muted-foreground'>
                                名前
                            </dt>
                            <dd className='text-foreground'>{me.name}</dd>
                        </div>
                        <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
                            <dt className='w-24 font-medium text-muted-foreground'>
                                メール
                            </dt>
                            <dd className='break-all text-foreground'>
                                {me.email}
                            </dd>
                        </div>
                        <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
                            <dt className='w-24 font-medium text-muted-foreground'>
                                ロール
                            </dt>
                            <dd className='text-foreground'>
                                {ROLE_LABELS[me.role] ?? me.role}
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* パスワード変更 */}
            <PasswordChangeForm />

            {/* ユーザー管理（admin のみ） */}
            {isAdmin && <UserRolePanel initialUsers={users} />}

            {/* 管理メニュー（admin のみ） */}
            {isAdmin && (
                <section aria-labelledby='admin-menu-heading'>
                    <h2
                        id='admin-menu-heading'
                        className='mb-4 font-semibold text-foreground text-lg'
                    >
                        管理メニュー
                    </h2>
                    <div className='rounded-lg border border-border bg-card p-6'>
                        <a
                            href='/admin/access-codes'
                            className='inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline'
                        >
                            アクセスコード管理 →
                        </a>
                    </div>
                </section>
            )}
        </div>
    );
}
