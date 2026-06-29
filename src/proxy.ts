import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;
  
  // Custom JWT (WA+PIN)
  const bmToken = request.cookies.get('bm-token')?.value;
  // Supabase Auth (Google)
  const sbCookie = request.cookies.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  
  let role: string | null = null;
  
  if (bmToken) {
    try {
      const payload = decodeJwt(bmToken) as { role: string };
      if (payload && payload.role) {
        role = payload.role;
      }
    } catch {}
  } else if (sbCookie) {
    // Supabase login (Google OAuth) is specifically for Jamaah as per requirements.
    // If Admin needs Google Login, they can be handled in Server Components directly, 
    // but for middleware routing we assume 'jamaah'.
    role = 'jamaah';
  }

  const isDashboard = path.startsWith('/dashboard');
  const isAdmin = path.startsWith('/admin');
  const isAuth = path === '/login' || path === '/daftar';

  // 1. Not logged in trying to access protected routes
  if (!role && (isDashboard || isAdmin)) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (role) {
    // 2. Logged in trying to access auth pages
    if (isAuth) {
      url.pathname = role === 'jamaah' ? '/dashboard' : '/admin';
      return NextResponse.redirect(url);
    }
    
    // 3. Jamaah trying to access admin
    if (isAdmin && role === 'jamaah') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // 4. Staff trying to access dashboard → redirect ke admin
    if (isDashboard && ['admin', 'bendahara', 'verifikator'].includes(role)) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  // Update Supabase session if using Supabase Auth (Google OAuth)
  // But wait, the instruction says: Middleware cukup check cookie ada + decode, tidak perlu ke DB.
  // We can skip `updateSession` here to keep it simple, Server Components will fetch user from DB if needed.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};
