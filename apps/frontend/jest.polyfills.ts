// jest の jsdom 環境は Node.js のネイティブ Web API グローバルを継承しない。
// MSW v2 の @mswjs/interceptors / ws.ts が以下を参照するため先に global に注入する。
//   - TextEncoder / TextDecoder
//   - ReadableStream / WritableStream / TransformStream
//   - MessagePort / MessageChannel / BroadcastChannel
//   - fetch / Request / Response / Headers

/* eslint-disable @typescript-eslint/no-require-imports */
// biome-ignore lint/suspicious/noExplicitAny: polyfill requires any

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
