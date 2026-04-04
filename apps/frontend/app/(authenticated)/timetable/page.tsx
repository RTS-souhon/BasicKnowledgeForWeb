import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

type TimetableItem = {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string | null;
};

async function fetchTimetable(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<TimetableItem[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/timetable`, {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { items: TimetableItem[] };
        return data.items ?? [];
    } catch {
        return [];
    }
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    });
}

export default async function TimetablePage({
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
                    タイムテーブル
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </div>
        );
    }

    const items = await fetchTimetable(eventId, authToken, accessToken, role);
    const sorted = [...items].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                タイムテーブル
            </h1>
            {sorted.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されているタイムテーブルはありません
                </p>
            ) : (
                <div className='space-y-2'>
                    {sorted.map((item, i) => {
                        const sameDay =
                            i > 0 &&
                            formatDate(item.startTime) ===
                                formatDate(sorted[i - 1].startTime);
                        return (
                            <div key={item.id}>
                                {!sameDay && (
                                    <p className='mt-6 mb-2 font-medium text-muted-foreground text-xs first:mt-0'>
                                        {formatDate(item.startTime)}
                                    </p>
                                )}
                                <div className='flex gap-4 rounded-lg border border-border bg-card p-4'>
                                    <div className='w-28 shrink-0 text-muted-foreground text-sm tabular-nums'>
                                        {formatTime(item.startTime)}〜
                                        {formatTime(item.endTime)}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='font-medium text-foreground text-sm'>
                                            {item.title}
                                        </p>
                                        <p className='mt-0.5 text-muted-foreground text-xs'>
                                            {item.location}
                                        </p>
                                        {item.description && (
                                            <p className='mt-1 text-muted-foreground text-xs'>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
