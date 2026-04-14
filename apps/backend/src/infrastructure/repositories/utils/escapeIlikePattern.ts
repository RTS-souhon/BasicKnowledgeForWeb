const ESCAPE_TARGET = /([%_\\])/g;

export function createIlikePattern(keyword: string) {
    const escaped = keyword.replace(ESCAPE_TARGET, '\\$1');
    return `%${escaped}%`;
}
