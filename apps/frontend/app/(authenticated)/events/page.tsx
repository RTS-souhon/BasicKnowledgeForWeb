import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

const DISPLAY_TIMEZONE = 'Asia/Tokyo';

type Program = {
    id: string;
    name: string;
    location: string;
    startTime: string;
    endTime: string;
    description: string | null;
};

async function fetchPrograms(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<Program[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/programs`, {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { programs: Program[] };
        return data.programs ?? [];
    } catch {
        return [];
    }
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('ja-JP', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: DISPLAY_TIMEZONE,
    });
}

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<{ event_id?: string }>;
}) {
    const { event_id } = await searchParams;
    const { eventId, authToken, accessToken, role } =
        await resolveAuth(event_id);

    if (!eventId) {
        return (
            <div>
                <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                    企画一覧
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </div>
        );
    }

    const programs = await fetchPrograms(eventId, authToken, accessToken, role);
    const sorted = [...programs].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                企画一覧
            </h1>
            {sorted.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されている企画はありません
                </p>
            ) : (
                <div className='grid gap-3 sm:grid-cols-2'>
                    {sorted.map((program) => (
                        <div
                            key={program.id}
                            className='rounded-lg border border-border bg-card p-4'
                        >
                            <p className='font-medium text-foreground text-sm'>
                                {program.name}
                            </p>
                            <p className='mt-1 text-muted-foreground text-xs'>
                                {program.location}
                            </p>
                            <p className='mt-1 text-muted-foreground text-xs tabular-nums'>
                                {formatDateTime(program.startTime)}〜
                                {formatDateTime(program.endTime)}
                            </p>
                            {program.description && (
                                <p className='mt-2 border-border border-t pt-2 text-muted-foreground text-xs'>
                                    {program.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
