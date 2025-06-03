import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected and public routes
const protectedRoutes = ['/enterprises'];
const publicRoutes = ['/login', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({ req: request });

  // Check if the route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // If no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // If not an admin, redirect to login
    if (token.role !== 'admin') {
      const url = new URL('/login', request.url);
      url.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(url);
    }

    // For enterprise-specific routes, verify access
    if (pathname.startsWith('/enterprises/')) {
      const enterpriseId = pathname.split('/')[2];
      if (enterpriseId && token.enterpriseId !== enterpriseId) {
        const url = new URL('/login', request.url);
        url.searchParams.set('error', 'AccessDenied');
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
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