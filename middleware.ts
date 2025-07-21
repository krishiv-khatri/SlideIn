import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return request.cookies.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        async remove(name: string, options: any) {
          response.cookies.delete(name);
        },
      },
    }
  );

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const url = request.nextUrl.pathname;
  const isAuthPage = url.startsWith('/sign-in') || url.startsWith('/sign-up');
  const isLandingPage = url === '/';
  const isProtectedRoute = 
    url.startsWith('/email-generator') ||
    url.startsWith('/settings') ||
    url.startsWith('/dashboard') ||
    url.startsWith('/analytics') ||
    url.startsWith('/inbox') ||
    url.startsWith('/(main)');

  // If user is logged in
  if (user) {
    // Redirect away from auth pages to the main app
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/email-generator', request.url));
    }
    
    // Redirect away from landing page to the main app  
    if (isLandingPage) {
      return NextResponse.redirect(new URL('/email-generator', request.url));
    }
  } 
  // If user is not logged in
  else {
    // Redirect protected routes to sign-in
    if (isProtectedRoute) {
      const redirectUrl = new URL('/sign-in', request.url);
      redirectUrl.searchParams.set('redirectedFrom', url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     * - auth/callback (auth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)',
  ],
}; 