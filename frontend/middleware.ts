import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session token
  const token = await getToken({ req: request });

  // Handle public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If user is logged in and tries to access login or root, redirect to their dashboard
    if (token && (pathname === '/login' || pathname === '/')) {
      return NextResponse.redirect(new URL(`/enterprises/${token.enterpriseId}`, request.url));
    }
    return NextResponse.next();
  }

  // If user is not logged in and tries to access any protected route
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Handle enterprise-specific routes
  if (pathname.startsWith('/enterprises/')) {
    const enterpriseId = pathname.split('/')[2];
    
    // If user tries to access a different enterprise
    if (enterpriseId && token.enterpriseId !== enterpriseId) {
      return NextResponse.redirect(new URL(`/enterprises/${token.enterpriseId}`, request.url));
    }

    // If not an admin, redirect to login
    if (token.role !== 'admin') {
      const url = new URL('/login', request.url);
      url.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(url);
    }
  }

  // For all other routes, allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};  