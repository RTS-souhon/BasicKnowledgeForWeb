import { verify } from 'hono/jwt';
import { type NextRequest, NextResponse } from 'next/server';

// JWT_SECRET は Edge Runtime では process.env から取得
const JWT_SECRET = process.env.JWT_SECRET ?? '';

type AuthPayload = { id: string; role: string; exp: number };
type AccessPayload = { event_id: string; exp: number };

async function verifyToken<T>(token: string): Promise<T | null> {
    try {
        const payload = await verify(token, JWT_SECRET, 'HS256');
        return payload as T;
    } catch {
        return null;
    }
}

// コンテンツページ: access_token または auth_token(admin/developer) が必要
const CONTENT_PATHS = ['/', '/timetable', '/rooms', '/events', '/shop', '/others', '/search'];

// ユーザー認証が必要
const USER_AUTH_PATHS = ['/dashboard'];

// admin/developer 専用
const ADMIN_PATHS = ['/admin'];

// 公開ページ（認証不要）
const PUBLIC_PATHS = ['/login', '/register', '/access'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authToken = request.cookies.get('auth_token')?.value;
    const accessToken = request.cookies.get('access_token')?.value;

    if (pathname.startsWith('/login')) {
        if (authToken) {
            const auth = await verifyToken<AuthPayload>(authToken);
            if (auth) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/access')) {
        if (authToken) {
            const auth = await verifyToken<AuthPayload>(authToken);
            if (auth && ['admin', 'developer'].includes(auth.role)) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
        if (accessToken) {
            const access = await verifyToken<AccessPayload>(accessToken);
            if (access) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
        return NextResponse.next();
    }

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // --- admin/* 保護 ---
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const auth = await verifyToken<AuthPayload>(authToken);
        if (!auth || !['admin', 'developer'].includes(auth.role)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // --- /dashboard 保護 ---
    if (USER_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const auth = await verifyToken<AuthPayload>(authToken);
        if (!auth) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // --- コンテンツページ保護 ---
    if (CONTENT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
        // admin/developer はユーザー認証で通過
        if (authToken) {
            const auth = await verifyToken<AuthPayload>(authToken);
            if (auth && ['admin', 'developer'].includes(auth.role)) {
                return NextResponse.next();
            }
        }
        // 一般ユーザーはアクセスコードで通過
        if (accessToken) {
            const access = await verifyToken<AccessPayload>(accessToken);
            if (access) {
                return NextResponse.next();
            }
        }
        return NextResponse.redirect(new URL('/access', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
