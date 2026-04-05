import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

type OtherItem = {
    id: string;
    title: string;
    content: string;
    displayOrder: number;
};

async function fetchOtherItems(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<OtherItem[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/others`, {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { items: OtherItem[] };
        return data.items ?? [];
    } catch {
        return [];
    }
}

export default async function OthersPage({
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
                    情報
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </div>
        );
    }

    const items = await fetchOtherItems(eventId, authToken, accessToken, role);
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                情報
            </h1>
            {sorted.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されている情報はありません
                </p>
            ) : (
                <div className='space-y-4'>
                    {sorted.map((item) => (
                        <div
                            key={item.id}
                            className='rounded-lg border border-border bg-card p-4'
                        >
                            <p className='font-medium text-foreground text-sm'>
                                {item.title}
                            </p>
                            <p className='mt-2 whitespace-pre-wrap text-muted-foreground text-sm'>
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
