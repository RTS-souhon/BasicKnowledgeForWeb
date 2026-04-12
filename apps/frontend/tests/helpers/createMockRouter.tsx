import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReactNode } from 'react';

type MockRouter = Partial<AppRouterInstance>;

export function createMockRouter(overrides: MockRouter = {}): AppRouterInstance {
    return {
        back: jest.fn(),
        forward: jest.fn(),
        push: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        ...overrides,
    } as AppRouterInstance;
}

export function AppRouterWrapper({
    children,
    router,
}: {
    children: ReactNode;
    router?: MockRouter;
}) {
    return (
        <AppRouterContext.Provider value={createMockRouter(router)}>
            {children}
        </AppRouterContext.Provider>
    );
}
