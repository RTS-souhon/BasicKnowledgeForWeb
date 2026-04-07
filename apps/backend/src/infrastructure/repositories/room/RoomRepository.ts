import type { createDatabaseClient } from '@backend/src/db/connection';
import { departments, rooms } from '@backend/src/db/schema';
import { createIlikePattern } from '@backend/src/infrastructure/repositories/utils/escapeIlikePattern';
import { and, asc, eq, ilike, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/cockroach-core';
import type { IRoomRepository, RoomWithDepartments } from './IRoomRepository';

type DatabaseClient = ReturnType<typeof createDatabaseClient>;

const preDayDept = alias(departments, 'pre_day_dept');
const dayDept = alias(departments, 'day_dept');

export class RoomRepository implements IRoomRepository {
    constructor(private readonly db: DatabaseClient) {}

    async findByEventId(eventId: string): Promise<RoomWithDepartments[]> {
        return this.db
            .select({
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
            })
            .from(rooms)
            .leftJoin(preDayDept, eq(rooms.preDayManagerId, preDayDept.id))
            .innerJoin(dayDept, eq(rooms.dayManagerId, dayDept.id))
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
        return this.db
            .select({
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
            })
            .from(rooms)
            .leftJoin(preDayDept, eq(rooms.preDayManagerId, preDayDept.id))
            .innerJoin(dayDept, eq(rooms.dayManagerId, dayDept.id))
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
}
