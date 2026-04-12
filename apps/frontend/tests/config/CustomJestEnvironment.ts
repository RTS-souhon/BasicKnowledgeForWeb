import JsdomEnvironment from 'jest-environment-jsdom';

function hijackModule(moduleName: string, exportsValue: unknown) {
    try {
        const resolved = require.resolve(moduleName);
        const moduleRecord: NodeJS.Module = {
            id: resolved,
            filename: resolved,
            loaded: true,
            exports: exportsValue,
            children: [],
            paths: [],
            parent: undefined,
        } as NodeJS.Module;
        require.cache[resolved] = moduleRecord;
    } catch {
        // ignore if module cannot be resolved (optional dependency)
    }
}

const lruCacheMock = require('../mocks/lru-cache.js');
hijackModule('lru-cache', lruCacheMock);

const cssColorMock = require('../mocks/css-color.js');
hijackModule('@asamuzakjp/css-color', cssColorMock);
hijackModule('@asamuzakjp/css-color/dist/cjs/index.cjs', cssColorMock);

export default class CustomJestEnvironment extends JsdomEnvironment {}
