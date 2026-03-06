import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPagePaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
