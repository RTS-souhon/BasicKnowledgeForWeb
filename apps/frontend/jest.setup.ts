import '@testing-library/jest-dom';
import { server } from './tests/mocks/server';

jest.mock('lru-cache', () => {
    // 新旧エクスポート形式に両対応させ、LRUCache クラスを必ず提供する
    const actual = jest.requireActual('lru-cache');
    const LRUCache = actual.LRUCache ?? actual;
    return { ...actual, LRUCache };
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
