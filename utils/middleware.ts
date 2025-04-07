import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('loggedInAdmin')?.value;
  const verifyStatus = request.cookies.get('verifyStatus')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/reset-password'];
  
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check if user is logged in
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if user needs verification
  if ((verifyStatus === 'FALSE' || !verifyStatus) && request.nextUrl.pathname !== '/verify') {
    return NextResponse.redirect(new URL('/verify', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};