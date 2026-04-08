import { describe, expect, it, jest } from '@jest/globals';
import { Hono } from 'hono';
import { searchContent } from '@backend/src/presentation/controllers/searchController';
import type {
    ISearchUseCase,
    SearchUseCaseResult,
} from '@backend/src/use-cases/search/ISearchUseCase';

function createApp(useCase: ISearchUseCase) {
    const app = new Hono();
    app.get('/search', (c) => searchContent(c, useCase));
    return app;
}

function buildUseCase(result: SearchUseCaseResult): ISearchUseCase {
    return {
        execute: jest
            .fn<
                (keyword: string, eventId: string) => Promise<SearchUseCaseResult>
            >()
            .mockResolvedValue(result),
    };
}

const successPayload: SearchUseCaseResult = {
    success: true,
    data: {
        timetable: [],
        rooms: [],
        programs: [],
        shopItems: [],
        otherItems: [],
    },
};

const EVENT_ID = '00000000-0000-4000-8000-000000000001';

describe('searchContent controller', () => {
    it('q 未指定のとき 400 を返す', async () => {
        const useCase = buildUseCase(successPayload);
        const app = createApp(useCase);

        const res = await app.request('/search', {
            headers: { 'x-event-id': 'event-1' },
        });

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('バリデーションエラー');
    });

    it('x-event-id 未指定で 400 を返す', async () => {
        const useCase = buildUseCase(successPayload);
        const app = createApp(useCase);

        const res = await app.request('/search?q=foo');

        expect(res.status).toBe(400);
        const body = (await res.json()) as { error: string };
        expect(body.error).toBe('バリデーションエラー');
    });

    it('正常系で 200 と結果を返す', async () => {
        const useCase = buildUseCase(successPayload);
        const app = createApp(useCase);

        const res = await app.request('/search?q=foo', {
            headers: { 'x-event-id': EVENT_ID },
        });
        const body = (await res.json()) as typeof successPayload.data;

        expect(res.status).toBe(200);
        expect(body).toEqual(successPayload.data);
        expect(useCase.execute).toHaveBeenCalledWith('foo', EVENT_ID);
    });

    it('UseCase が失敗したとき 500 を返す', async () => {
        const useCase: ISearchUseCase = {
            execute: jest
                .fn<
                    (keyword: string, eventId: string) => Promise<SearchUseCaseResult>
                >()
                .mockResolvedValue({
                    success: false,
                    error: '検索に失敗しました',
                }),
        };
        const app = createApp(useCase);

        const res = await app.request('/search?q=foo', {
            headers: { 'x-event-id': EVENT_ID },
        });

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: '検索に失敗しました' });
    });
});
