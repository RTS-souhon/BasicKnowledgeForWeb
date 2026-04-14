import type { createDatabaseClient } from '@backend/src/db/connection';
import { departments, rooms } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/cockroach-core';
import type {
    CreateRoomInput,
    IRoomRepository,
    RoomWithDepartments,
    UpdateRoomInput,
} from './IRoomRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

const preDayDept = alias(departments, 'pre_day_dept');
const dayDept = alias(departments, 'day_dept');

const roomSelection = {
    id: rooms.id,
    eventId: rooms.eventId,
    buildingName: rooms.buildingName,
    floor: rooms.floor,
    roomName: rooms.roomName,
    preDayManagerId: rooms.preDayManagerId,
    preDayManagerName: preDayDept.name,
    preDayPurpose: rooms.preDayPurpose,
    dayManagerId: rooms.dayManagerId,
    dayManagerName: dayDept.name,
    dayPurpose: rooms.dayPurpose,
    notes: rooms.notes,
    createdAt: rooms.createdAt,
    updatedAt: rooms.updatedAt,
};

export class RoomRepository implements IRoomRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<RoomWithDepartments[]> {
        return this.selectRooms()
            .where(eq(rooms.eventId, eventId))
            .orderBy(
                asc(rooms.buildingName),
                asc(rooms.floor),
                asc(rooms.roomName),
            );
    }

    async search(
        keyword: string,
        eventId: string,
    ): Promise<RoomWithDepartments[]> {
        const pattern = createIlikePattern(keyword);
        return this.selectRooms()
            .where(
                and(
                    eq(rooms.eventId, eventId),
                    or(
                        ilike(rooms.buildingName, pattern),
                        ilike(rooms.floor, pattern),
                        ilike(rooms.roomName, pattern),
                        ilike(rooms.preDayPurpose, pattern),
                        ilike(rooms.dayPurpose, pattern),
                        ilike(rooms.notes, pattern),
                        ilike(preDayDept.name, pattern),
                        ilike(dayDept.name, pattern),
                    ),
                ),
            )
            .orderBy(
                asc(rooms.buildingName),
                asc(rooms.floor),
                asc(rooms.roomName),
            );
    }

    async create(input: CreateRoomInput): Promise<RoomWithDepartments> {
        const [inserted] = await this.db
            .insert(rooms)
            .values(input)
            .returning({ id: rooms.id, eventId: rooms.eventId });
        if (!inserted) {
            throw new Error('部屋の作成に失敗しました');
        }
        return this.findOne(inserted.id, inserted.eventId);
    }

    async update(
        id: string,
        eventId: string,
        input: UpdateRoomInput,
    ): Promise<RoomWithDepartments | null> {
        const [updated] = await this.db
            .update(rooms)
            .set({ ...input, updatedAt: new Date() })
            .where(and(eq(rooms.id, id), eq(rooms.eventId, eventId)))
            .returning({ id: rooms.id, eventId: rooms.eventId });

        if (!updated) {
            return null;
        }
        return this.findOne(updated.id, updated.eventId);
    }

    async delete(id: string, eventId: string): Promise<boolean> {
        const deleted = await this.db
            .delete(rooms)
            .where(and(eq(rooms.id, id), eq(rooms.eventId, eventId)))
            .returning({ id: rooms.id });
        return deleted.length > 0;
    }

    private selectRooms() {
        return this.db
            .select(roomSelection)
            .from(rooms)
            .leftJoin(preDayDept, eq(rooms.preDayManagerId, preDayDept.id))
            .innerJoin(dayDept, eq(rooms.dayManagerId, dayDept.id));
    }

    private async findOne(
        id: string,
        eventId: string,
    ): Promise<RoomWithDepartments> {
        const [room] = await this.selectRooms()
            .where(and(eq(rooms.id, id), eq(rooms.eventId, eventId)))
            .limit(1);
        if (!room) {
            throw new Error('部屋の取得に失敗しました');
        }
        return room;
    }
}
