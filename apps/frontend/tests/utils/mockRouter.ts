export type RouterMock = {
    push: jest.Mock;
    replace: jest.Mock;
    refresh: jest.Mock;
    back: jest.Mock;
    forward: jest.Mock;
    prefetch: jest.Mock;
};

export function createRouterMock(
    overrides: Partial<RouterMock> = {},
): RouterMock {
    return {
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}
