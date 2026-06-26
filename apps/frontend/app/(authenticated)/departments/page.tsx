import { fetchFromBackend } from '@frontend/app/lib/backendFetch';
import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';
import { redirect } from 'next/navigation';
import DepartmentAdminPanel from './DepartmentAdminPanel';

type Department = {
    id: string;
    name: string;
};

async function fetchDepartments(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<Department[]> {
    try {
        const res = await fetchFromBackend('/api/departments', {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { departments: Department[] };
        return data.departments ?? [];
    } catch {
        return [];
    }
}

export default async function DepartmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ event_id?: string }>;
}) {
    const { event_id } = await searchParams;
    const { eventId, authToken, accessToken, role } =
        await resolveAuth(event_id);

    if (role !== 'admin') {
        redirect('/dashboard');
    }

    if (!eventId) {
        return (
            <section aria-labelledby='departments-heading'>
                <h1
                    id='departments-heading'
                    className='mb-4 font-semibold text-foreground text-xl tracking-tight'
                >
                    部署管理
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </section>
        );
    }

    const departments = await fetchDepartments(
        eventId,
        authToken,
        accessToken,
        role,
    );

    return <DepartmentAdminPanel departments={departments} eventId={eventId} />;
}
