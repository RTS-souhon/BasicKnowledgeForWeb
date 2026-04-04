import {
    buildContentFetchHeaders,
    resolveAuth,
} from '@frontend/app/lib/serverAuth';

type RoomWithDepartments = {
    id: string;
    buildingName: string;
    floor: string;
    roomName: string;
    preDayManagerId: string | null;
    preDayManagerName: string | null;
    preDayPurpose: string | null;
    dayManagerId: string;
    dayManagerName: string;
    dayPurpose: string;
    notes: string | null;
};

async function fetchRooms(
    eventId: string,
    authToken: string | null,
    accessToken: string | null,
    role: string,
): Promise<RoomWithDepartments[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    try {
        const res = await fetch(`${apiUrl}/api/rooms`, {
            headers: buildContentFetchHeaders(
                eventId,
                authToken,
                accessToken,
                role,
            ),
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { rooms: RoomWithDepartments[] };
        return data.rooms ?? [];
    } catch {
        return [];
    }
}

export default async function RoomsPage({
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
                    部屋割り
                </h1>
                <p className='text-muted-foreground text-sm'>
                    会期が選択されていません
                </p>
            </div>
        );
    }

    const rooms = await fetchRooms(eventId, authToken, accessToken, role);

    // Building → Floor → Room の順でグループ化
    const grouped = rooms.reduce<
        Record<string, Record<string, RoomWithDepartments[]>>
    >((acc, room) => {
        if (!acc[room.buildingName]) acc[room.buildingName] = {};
        if (!acc[room.buildingName][room.floor])
            acc[room.buildingName][room.floor] = [];
        acc[room.buildingName][room.floor].push(room);
        return acc;
    }, {});

    return (
        <div>
            <h1 className='mb-6 font-semibold text-foreground text-xl tracking-tight'>
                部屋割り
            </h1>
            {rooms.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                    登録されている部屋割りはありません
                </p>
            ) : (
                <div className='space-y-8'>
                    {Object.entries(grouped).map(([building, floors]) => (
                        <section key={building}>
                            <h2 className='mb-3 font-medium text-base text-foreground'>
                                {building}
                            </h2>
                            <div className='space-y-4'>
                                {Object.entries(floors).map(
                                    ([floor, roomList]) => (
                                        <div key={floor}>
                                            <p className='mb-2 font-medium text-muted-foreground text-xs'>
                                                {floor}
                                            </p>
                                            <div className='space-y-2'>
                                                {roomList.map((room) => (
                                                    <div
                                                        key={room.id}
                                                        className='rounded-lg border border-border bg-card p-4'
                                                    >
                                                        <p className='font-medium text-foreground text-sm'>
                                                            {room.roomName}
                                                        </p>
                                                        <div className='mt-2 space-y-1'>
                                                            {room.preDayManagerName && (
                                                                <div className='flex gap-2 text-xs'>
                                                                    <span className='w-16 shrink-0 text-muted-foreground'>
                                                                        前日
                                                                    </span>
                                                                    <span className='text-foreground'>
                                                                        {
                                                                            room.preDayManagerName
                                                                        }
                                                                        {room.preDayPurpose &&
                                                                            ` — ${room.preDayPurpose}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className='flex gap-2 text-xs'>
                                                                <span className='w-16 shrink-0 text-muted-foreground'>
                                                                    当日
                                                                </span>
                                                                <span className='text-foreground'>
                                                                    {
                                                                        room.dayManagerName
                                                                    }{' '}
                                                                    —{' '}
                                                                    {
                                                                        room.dayPurpose
                                                                    }
                                                                </span>
                                                            </div>
                                                            {room.notes && (
                                                                <div className='flex gap-2 text-xs'>
                                                                    <span className='w-16 shrink-0 text-muted-foreground'>
                                                                        備考
                                                                    </span>
                                                                    <span className='text-muted-foreground'>
                                                                        {
                                                                            room.notes
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
