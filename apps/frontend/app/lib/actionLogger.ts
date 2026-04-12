/**
 * Server Actions 用ログユーティリティ。
 * Cloudflare Workers 上の console.log は Workers Observability に記録される。
 */

export function logAction(
    action: string,
    method: string,
    url: string,
    status: number,
): void {
    console.log(`[action] ${method} ${url} → ${status}`, { action });
}

export function logActionError(
    action: string,
    method: string,
    url: string,
    error: unknown,
): void {
    console.error(`[action] ${method} ${url} → ERROR`, {
        action,
        error: error instanceof Error ? error.message : String(error),
    });
}
