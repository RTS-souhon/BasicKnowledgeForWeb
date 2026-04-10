import { beforeAll, it } from '@jest/globals';
import type { Env } from '@backend/src/db/connection';
import type { ITimetableRepository, TimetableItem } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import { sign } from 'hono/jwt';
import { createTestAppWithTimetable } from './helpers/createTestApp';

const JWT_SECRET = 'test-secret';
const mockEnv = { JWT_SECRET } as unknown as Env;
const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const ITEM_ID = '10000000-0000-0000-0000-000000000001';

const item1: TimetableItem = {
    id: ITEM_ID, eventId: EVENT_ID, title: '開会式',
    startTime: new Date(), endTime: new Date(), location: 'A',
    description: null, createdAt: new Date(), updatedAt: new Date(),
};

let adminToken: string;
beforeAll(async () => {
    adminToken = await sign(
        { id: 'admin-id', name: 'Admin', email: 'admin@test.com', role: 'admin', exp: Math.floor(Date.now()/1000)+3600 },
        JWT_SECRET, 'HS256',
    );
});

it('debug DELETE', async () => {
    const repo: ITimetableRepository = {
        findByEventId: () => Promise.resolve([]),
        search: () => Promise.resolve([]),
        create: () => Promise.resolve(item1),
        update: () => Promise.resolve(item1),
        delete: () => Promise.resolve(true),
    };
    const app = createTestAppWithTimetable(repo);
    const res = await app.request(
        `/api/timetable/${ITEM_ID}`,
        { method: 'DELETE', headers: { 'x-event-id': EVENT_ID, Cookie: `auth_token=${adminToken}` } },
        mockEnv,
    );
    console.log('DELETE Status:', res.status, 'Body:', await res.text());
});

it('debug PUT', async () => {
    const repo: ITimetableRepository = {
        findByEventId: () => Promise.resolve([]),
        search: () => Promise.resolve([]),
        create: () => Promise.resolve(item1),
        update: () => Promise.resolve(item1),
        delete: () => Promise.resolve(true),
    };
    const app = createTestAppWithTimetable(repo);
    const res = await app.request(
        `/api/timetable/${ITEM_ID}`,
        {
            method: 'PUT',
            headers: { 'x-event-id': EVENT_ID, 'Content-Type': 'application/json', Cookie: `auth_token=${adminToken}` },
            body: JSON.stringify({ title: '変更後タイトル' }),
        },
        mockEnv,
    );
    console.log('PUT Status:', res.status, 'Body:', await res.text());
});
