import Link from 'next/link';

const NAV_CARDS = [
    {
        href: '/timetable',
        label: 'タイムテーブル',
        description: '当日のスケジュール',
    },
    {
        href: '/rooms',
        label: '部屋割り',
        description: '会場・スペース割り当て',
    },
    { href: '/events', label: '企画一覧', description: '企画と詳細情報' },
    { href: '/shop', label: '販売物一覧', description: '頒布物・価格情報' },
    { href: '/others', label: '情報', description: 'その他のお知らせ' },
] as const;

export default function HomePage() {
    return (
        <div>
            <h1 className='mb-8 font-semibold text-foreground text-xl tracking-tight'>
                ようこそ
            </h1>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {NAV_CARDS.map(({ href, label, description }) => (
                    <Link
                        key={href}
                        href={href}
                        className='group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md'
                    >
                        <span className='font-medium text-foreground text-sm'>
                            {label}
                        </span>
                        <span className='text-muted-foreground text-xs'>
                            {description}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
