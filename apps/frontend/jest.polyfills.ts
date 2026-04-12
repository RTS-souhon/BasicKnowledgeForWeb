// jest の jsdom 環境は Node.js のネイティブ Web API グローバルを継承しない。
// MSW v2 の @mswjs/interceptors / ws.ts が以下を参照するため先に global に注入する。
//   - TextEncoder / TextDecoder
//   - ReadableStream / WritableStream / TransformStream
//   - MessagePort / MessageChannel / BroadcastChannel
//   - fetch / Request / Response / Headers

/* eslint-disable @typescript-eslint/no-require-imports */
// biome-ignore lint/suspicious/noExplicitAny: polyfill requires any

// 0. React 18+/19 act() サポート: jsdom16 では自動判定されないため手動で有効化
const globalForAct = globalThis as {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
    window?: { IS_REACT_ACT_ENVIRONMENT?: boolean };
};
globalForAct.IS_REACT_ACT_ENVIRONMENT = true;
if (globalForAct.window) {
    globalForAct.window.IS_REACT_ACT_ENVIRONMENT = true;
}

// 1. TextEncoder / TextDecoder (Node.js 組み込み)
const { TextDecoder, TextEncoder } = require('node:util') as any;
Object.assign(global, { TextDecoder, TextEncoder });

// 2. Streams API (Node.js 組み込み)
const { ReadableStream, WritableStream, TransformStream } =
    require('node:stream/web') as any;
Object.assign(global, { ReadableStream, WritableStream, TransformStream });

// 3. MessagePort / MessageChannel / BroadcastChannel
//    undici の webidl と MSW の WebSocket サポートが参照する
const { MessagePort, MessageChannel, BroadcastChannel } =
    require('node:worker_threads') as any;
Object.assign(global, { MessagePort, MessageChannel, BroadcastChannel });

// 4. Fetch API — cross-fetch は ブラウザ / Node.js 両環境で動く自己完結型ポリフィル
require('cross-fetch/polyfill');

// 5. lru-cache は CJS / ESM 両対応だが、依存ライブラリが `new LRUCache()` を期待する。
//    Jest の CJS 変換下でも必ずクラスを提供するようエクスポートを補強する。
const lruCacheMock = require('./tests/mocks/lru-cache.js');
const lruCachePath = require.resolve('lru-cache');
require.cache[lruCachePath] = {
    id: lruCachePath,
    filename: lruCachePath,
    loaded: true,
    exports: lruCacheMock,
};

const cssColorMock = require('./tests/mocks/css-color.js');
const cssColorTargets = [
    '@asamuzakjp/css-color',
    '@asamuzakjp/css-color/dist/cjs/index.cjs',
];
for (const target of cssColorTargets) {
    try {
        const resolved = require.resolve(target);
        require.cache[resolved] = {
            id: resolved,
            filename: resolved,
            loaded: true,
            exports: cssColorMock,
        };
    } catch {
        // ignore if module path cannot be resolved (should not happen)
    }
}
