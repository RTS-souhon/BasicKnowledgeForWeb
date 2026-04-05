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

type RoomFloorGroup = {
    name: string;
    rooms: RoomWithDepartments[];
};

type RoomGroup = {
    building: string;
    floors: RoomFloorGroup[];
};

function formatValue(value: string | null): string {
    if (!value) return '—';
    const trimmed = value.trim();
    return trimmed.length === 0 ? '—' : trimmed;
}

function groupRooms(rooms: RoomWithDepartments[]): RoomGroup[] {
    const buildingMap = new Map<string, Map<string, RoomWithDepartments[]>>();

    for (const room of rooms) {
        if (!buildingMap.has(room.buildingName)) {
            buildingMap.set(room.buildingName, new Map());
        }
        const floors = buildingMap.get(room.buildingName)!;
        if (!floors.has(room.floor)) {
            floors.set(room.floor, []);
        }
        floors.get(room.floor)!.push(room);
    }

    return Array.from(buildingMap.entries()).map(([building, floors]) => ({
        building,
        floors: Array.from(floors.entries()).map(([name, entries]) => ({
            name,
            rooms: entries,
        })),
    }));
}

function DesktopRoomsTable({ groups }: { groups: RoomGroup[] }) {
    return (
        <div className='hidden flex-col gap-8 md:flex'>
            {groups.map(({ building, floors }) => (
                <section key={`desktop-${building}`} className='space-y-3'>
                    <h2 className='font-medium text-base text-foreground'>
                        {building}
                    </h2>
                    {floors.map(({ name, rooms }) => (
                        <div
                            key={`desktop-${building}-${name}`}
                            className='space-y-2'
                        >
                            <p className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                                {name}
                            </p>
                            <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
                                <table
                                    aria-label={`${building} ${name} 部屋割り`}
                                    className='w-full border-collapse text-sm'
                                >
                                    <thead>
                                        <tr className='bg-muted/40 text-left font-medium text-[13px] text-muted-foreground'>
                                            <th className='px-4 py-3'>
                                                部屋名
                                            </th>
                                            <th className='px-4 py-3'>担当</th>
                                            <th className='px-4 py-3'>用途</th>
                                            <th className='px-4 py-3'>備考</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr
                                                key={room.id}
                                                className='border-border/60 border-t text-sm first:border-t-0'
                                            >
                                                <td className='px-4 py-3 font-medium text-foreground'>
                                                    {room.roomName}
                                                </td>
                                                <td className='px-4 py-3 align-top'>
                                                    <div className='space-y-1 text-foreground'>
                                                        <p className='flex items-baseline gap-2 text-muted-foreground text-xs uppercase tracking-wide'>
                                                            <span>前日</span>
                                                            <span className='text-foreground text-sm'>
                                                                {formatValue(
                                                                    room.preDayManagerName,
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className='flex items-baseline gap-2 text-muted-foreground text-xs uppercase tracking-wide'>
                                                            <span>当日</span>
                                                            <span className='text-foreground text-sm'>
                                                                {formatValue(
                                                                    room.dayManagerName,
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 align-top'>
                                                    <div className='space-y-1 text-foreground'>
                                                        <p className='flex items-baseline gap-2 text-muted-foreground text-xs uppercase tracking-wide'>
                                                            <span>前日</span>
                                                            <span className='text-foreground text-sm'>
                                                                {formatValue(
                                                                    room.preDayPurpose,
                                                                )}
                                                            </span>
                                                        </p>
                                                        <p className='flex items-baseline gap-2 text-muted-foreground text-xs uppercase tracking-wide'>
                                                            <span>当日</span>
                                                            <span className='text-foreground text-sm'>
                                                                {formatValue(
                                                                    room.dayPurpose,
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className='px-4 py-3 align-top text-foreground text-sm'>
                                                    <span className='text-muted-foreground text-sm'>
                                                        {formatValue(
                                                            room.notes,
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}

function buildAssignmentLine(
    manager: string | null,
    purpose: string | null,
): string {
    const namePart = formatValue(manager);
    const purposePart = formatValue(purpose);
    if (purposePart === '—') return namePart;
    if (namePart === '—') return purposePart;
    return `${namePart} — ${purposePart}`;
}

function MobileRoomsList({ groups }: { groups: RoomGroup[] }) {
    return (
        <div className='space-y-6 md:hidden'>
            {groups.map(({ building, floors }) => (
                <section key={`mobile-${building}`} className='space-y-3'>
                    <h2 className='font-medium text-base text-foreground'>
                        {building}
                    </h2>
                    {floors.map(({ name, rooms }) => (
                        <div
                            key={`mobile-${building}-${name}`}
                            className='space-y-3'
                        >
                            <p className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                                {name}
                            </p>
                            <div className='space-y-3'>
                                {rooms.map((room) => (
                                    <article
                                        key={`mobile-${room.id}`}
                                        className='rounded-xl border border-border bg-card p-4 shadow-sm'
                                    >
                                        <p className='font-semibold text-base text-foreground'>
                                            {room.roomName}
                                        </p>
                                        <div className='mt-3 space-y-2 text-sm'>
                                            <div>
                                                <p className='font-semibold text-[11px] text-muted-foreground uppercase tracking-wide'>
                                                    前日
                                                </p>
                                                <p className='text-foreground'>
                                                    {buildAssignmentLine(
                                                        room.preDayManagerName,
                                                        room.preDayPurpose,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className='font-semibold text-[11px] text-muted-foreground uppercase tracking-wide'>
                                                    当日
                                                </p>
                                                <p className='text-foreground'>
                                                    {buildAssignmentLine(
                                                        room.dayManagerName,
                                                        room.dayPurpose,
                                                    )}
                                                </p>
                                            </div>
                                            {room.notes && (
                                                <div>
                                                    <p className='font-semibold text-[11px] text-muted-foreground uppercase tracking-wide'>
                                                        備考
                                                    </p>
                                                    <p className='text-muted-foreground'>
                                                        {room.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}

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
    const sorted = [...rooms].sort((a, b) => {
        if (a.buildingName !== b.buildingName) {
            return a.buildingName.localeCompare(b.buildingName, 'ja');
        }
        if (a.floor !== b.floor) {
            return a.floor.localeCompare(b.floor, 'ja');
        }
        return a.roomName.localeCompare(b.roomName, 'ja');
    });
    const groups = groupRooms(sorted);

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
                    <DesktopRoomsTable groups={groups} />
                    <MobileRoomsList groups={groups} />
                </div>
            )}
        </div>
    );
}
