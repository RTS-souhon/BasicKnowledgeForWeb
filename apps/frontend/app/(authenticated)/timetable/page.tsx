import { fetchFromBackend } from '@frontend/app/lib/backendFetch';
import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';
import TimetableAdminPanel from './TimetableAdminPanel';

const DISPLAY_TIMEZONE = 'Asia/Tokyo';

type TimetableItem = {
    id: string;
    title: string;
    startTime: string;
    location: string;
    description: string | null;
};

type TimetableViewItem = TimetableItem & {
    dateLabel: string;
    timeLabel: string;
};

type TimetableGroup = {
    date: string;
    entries: TimetableViewItem[];
};

async function fetchTimetable(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<TimetableItem[]> {
    try {
        const res = await fetchFromBackend('/api/timetable', {
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

function formatDateLabel(date: Date): string {
    return date.toLocaleDateString('ja-JP', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: DISPLAY_TIMEZONE,
    });
}

function formatTimeLabel(start: Date): string {
    const format = new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: DISPLAY_TIMEZONE,
    });
    return format.format(start);
}

function buildViewItems(items: TimetableItem[]): TimetableViewItem[] {
    return items.map((item) => {
        const start = new Date(item.startTime);
        return {
            ...item,
            dateLabel: formatDateLabel(start),
            timeLabel: formatTimeLabel(start),
        };
    });
}

function groupByDate(items: TimetableViewItem[]): TimetableGroup[] {
    const map = new Map<string, TimetableViewItem[]>();
    for (const item of items) {
        const next = map.get(item.dateLabel) ?? [];
        next.push(item);
        map.set(item.dateLabel, next);
    }
    return Array.from(map.entries()).map(([date, entries]) => ({
        date,
        entries,
    }));
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

    if (role === 'admin') {
        return <TimetableAdminPanel items={items} eventId={eventId} />;
    }

    const sorted = [...items].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    const viewItems = buildViewItems(sorted);
    const grouped = groupByDate(viewItems);

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                タイムテーブル
            </h1>
            {viewItems.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されているタイムテーブルはありません
                </p>
            ) : (
                <div className='space-y-6'>
                    {grouped.map(({ date, entries }) => (
                        <section key={date}>
                            <p className='mb-2 font-medium text-muted-foreground text-xs'>
                                {date}
                            </p>
                            <div className='space-y-2'>
                                {entries.map((item) => (
                                    <article
                                        key={item.id}
                                        className='rounded-lg border border-border bg-card p-4'
                                    >
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4'>
                                            <p className='font-medium text-muted-foreground text-xs tabular-nums sm:w-36 sm:flex-none sm:text-sm'>
                                                {item.timeLabel}
                                            </p>
                                            <div className='flex-1 space-y-1'>
                                                <p className='font-semibold text-base text-foreground leading-tight sm:font-medium sm:text-sm'>
                                                    {item.title}
                                                </p>
                                                <p className='flex items-center gap-1 text-muted-foreground text-xs'>
                                                    <span aria-hidden='true'>
                                                        {'📍'}
                                                    </span>
                                                    <span>{item.location}</span>
                                                </p>
                                                {item.description && (
                                                    <p className='text-muted-foreground text-xs'>
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
