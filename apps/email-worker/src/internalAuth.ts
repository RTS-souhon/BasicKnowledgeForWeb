export function getBearerToken(authorization: string | null): string | null {
    if (!authorization) {
        return null;
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
}

export function isAuthorizedRequest(
    authorization: string | null,
    expectedToken: string,
): boolean {
    const token = getBearerToken(authorization);
    return token !== null && token === expectedToken;
}
