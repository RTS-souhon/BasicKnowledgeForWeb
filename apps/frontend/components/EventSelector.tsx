'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type AccessCode = { id: string; eventName: string };

type Props = {
    accessCodes: AccessCode[];
    variant?: 'header' | 'drawer';
};

export function EventSelector({ accessCodes, variant = 'header' }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentEventId = searchParams?.get('event_id') ?? '';

    // TODO: ここを実装してください（5〜10行）
    // admin/developer が会期を切り替えたとき、URL の ?event_id=xxx を更新します。
    //
    // 考慮すべきトレードオフ:
    //   - router.push()    → 履歴スタックに積む（「戻る」で前の会期に戻れる）
    //   - router.replace() → 履歴を上書き（戻るボタンの挙動が変わらない）
    //
    // ヒント:
    //   - `new URLSearchParams(searchParams.toString())` で現在のパラメータをコピー
    //   - 空値('') が選ばれた場合は event_id パラメータを削除する
    function handleChange(_eventId: string): void {
        // ここに実装してください
    }

    const baseClass =
        'rounded-sm border border-background/30 bg-transparent text-sm text-background focus:outline-none focus:ring-1 focus:ring-background/50 disabled:opacity-40';

    const sizeClass =
        variant === 'drawer'
            ? 'w-full px-2 py-2'
            : 'px-2 py-1';

    return (
        <select
            aria-label='会期を選択'
            value={currentEventId}
            disabled={accessCodes.length === 0}
            className={`${baseClass} ${sizeClass}`}
            onChange={(e) => handleChange(e.target.value)}
        >
            <option value=''>会期を選択</option>
            {accessCodes.map((code) => (
                <option key={code.id} value={code.id}>
                    {code.eventName}
                </option>
            ))}
        </select>
    );
}
