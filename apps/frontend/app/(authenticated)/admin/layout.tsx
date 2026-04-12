import { resolveAuth } from '@frontend/app/lib/serverAuth';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { authToken, role } = await resolveAuth();

    if (!authToken || role !== 'admin') {
        redirect('/login');
    }

    return <>{children}</>;
}
