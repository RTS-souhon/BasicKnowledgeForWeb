import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

type ShopItem = {
    id: string;
    name: string;
    price: number;
    stockStatus: string;
    description: string | null;
};

async function fetchShopItems(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<ShopItem[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/shop-items`, {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { items: ShopItem[] };
        return data.items ?? [];
    } catch {
        return [];
    }
}

const STOCK_LABELS: Record<string, string> = {
    available: '在庫あり',
    low: '残りわずか',
    sold_out: '売り切れ',
};

const STOCK_STYLES: Record<string, string> = {
    available:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    low: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    sold_out: 'bg-muted text-muted-foreground',
};

export default async function ShopPage({
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
                    販売物一覧
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </div>
        );
    }

    const items = await fetchShopItems(eventId, authToken, accessToken, role);

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                販売物一覧
            </h1>
            {items.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されている販売物はありません
                </p>
            ) : (
                <div className='grid gap-3 sm:grid-cols-2'>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className='rounded-lg border border-border bg-card p-4'
                        >
                            <div className='flex items-start justify-between gap-2'>
                                <p className='font-medium text-foreground text-sm'>
                                    {item.name}
                                </p>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 font-medium text-xs ${STOCK_STYLES[item.stockStatus] ?? STOCK_STYLES.available}`}
                                >
                                    {STOCK_LABELS[item.stockStatus] ??
                                        item.stockStatus}
                                </span>
                            </div>
                            <p className='mt-1 font-medium text-base text-foreground tabular-nums'>
                                ¥{item.price.toLocaleString('ja-JP')}
                            </p>
                            {item.description && (
                                <p className='mt-2 border-border border-t pt-2 text-muted-foreground text-xs'>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
