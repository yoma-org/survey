// src/proxy.ts (Next.js 16: renamed from middleware.ts)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionOptions } from './lib/auth';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard: protect all /[locale]/admin/* routes
  // Using jose jwtVerify (cryptographic) — mitigates CVE-2025-29927
  if (pathname.match(/\/(?:en|my)\/admin/)) {
    const sessionCookie = request.cookies.get(sessionOptions.cookieName)?.value;

    if (!sessionCookie) {
      const locale = pathname.startsWith('/my') ? 'my' : 'en';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      // Decrypt iron-session to get the JWT
      const { unsealData } = await import('iron-session');
      const session = await unsealData<{ token?: string }>(sessionCookie, {
        password: process.env.IRON_SESSION_PASSWORD!,
      });

      if (!session.token) throw new Error('No token in session');

      const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
      await jwtVerify(session.token, secret);
    } catch {
      const locale = pathname.startsWith('/my') ? 'my' : 'en';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
