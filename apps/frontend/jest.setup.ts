import '@testing-library/jest-dom';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;
const originalConsoleError = console.error;
const ACT_WARNING =
    'The current testing environment is not configured to support act(...)';
console.error = (...args: unknown[]) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes(ACT_WARNING)
    ) {
        return;
    }
    originalConsoleError(...args);
};
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
