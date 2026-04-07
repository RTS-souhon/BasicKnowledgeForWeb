import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

type StockStatus = 'available' | 'low' | 'sold_out';

type ShopItem = {
    id: string;
    name: string;
    price: number;
    stockStatus: StockStatus;
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

const STOCK_VARIANTS: Record<
    StockStatus,
    { label: string; badgeClass: string }
> = {
    available: {
        label: '在庫あり',
        badgeClass:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
    low: {
        label: '残りわずか',
        badgeClass:
            'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    },
    sold_out: {
        label: '完売',
        badgeClass:
            'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    },
};

const DEFAULT_STOCK = {
    label: '在庫状況不明',
    badgeClass: 'bg-muted text-muted-foreground',
};

const priceFormatter = new Intl.NumberFormat('ja-JP');

const sortByName = (items: ShopItem[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

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

    const items = sortByName(
        await fetchShopItems(eventId, authToken, accessToken, role),
    );

    const renderStock = (status: StockStatus | string) => {
        const variant = STOCK_VARIANTS[status as StockStatus] ?? DEFAULT_STOCK;
        return (
            <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 font-medium text-xs ${variant.badgeClass}`}
            >
                {variant.label}
            </span>
        );
    };

    const renderPrice = (price: number) => `¥${priceFormatter.format(price)}`;

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
                <div className='space-y-6'>
                    <div className='hidden overflow-x-auto rounded-xl border border-border md:block'>
                        <table
                            className='min-w-full divide-y divide-border text-sm'
                            aria-label='販売物一覧'
                        >
                            <thead className='bg-muted/40 text-left text-muted-foreground text-xs uppercase tracking-wide'>
                                <tr>
                                    <th className='px-4 py-3 font-medium'>
                                        商品名
                                    </th>
                                    <th className='px-4 py-3 font-medium'>
                                        価格
                                    </th>
                                    <th className='px-4 py-3 font-medium'>
                                        在庫
                                    </th>
                                    <th className='px-4 py-3 font-medium'>
                                        説明
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-border bg-card text-foreground'>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className='px-4 py-3 align-top font-medium'>
                                            {item.name}
                                        </td>
                                        <td className='px-4 py-3 align-top tabular-nums'>
                                            {renderPrice(item.price)}
                                        </td>
                                        <td className='px-4 py-3 align-top'>
                                            {renderStock(item.stockStatus)}
                                        </td>
                                        <td className='px-4 py-3 align-top text-muted-foreground text-xs'>
                                            {item.description ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='space-y-3 md:hidden'>
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className='rounded-xl border border-border bg-card p-4'
                            >
                                <div className='flex items-center justify-between gap-2'>
                                    <p className='font-medium text-base text-foreground'>
                                        {item.name}
                                    </p>
                                    {renderStock(item.stockStatus)}
                                </div>
                                <p className='mt-2 font-semibold text-foreground tabular-nums'>
                                    {renderPrice(item.price)}
                                </p>
                                {item.description && (
                                    <p className='mt-3 text-muted-foreground text-sm'>
                                        {item.description}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
