import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lms-super-secret-key-change-in-production-32chars'
);

const publicPagePaths = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes handle their own auth — never redirect them
  if (pathname.startsWith('/api/')) return NextResponse.next();
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const isPublic = publicPagePaths.some((p) => pathname.startsWith(p));
  const token = request.cookies.get('lms-session')?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes — only admins may access /admin/*
  if (pathname.startsWith('/admin') && token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if ((payload as { role?: string }).role !== 'admin') {
        return NextResponse.redirect(new URL('/courses', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
