import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // Max 60 requests per min for standard endpoints
const STRICT_MAX_REQUESTS = 20; // Max 20 requests per min for sensitive mutating endpoints

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://cafe-aura-mgxg.vercel.app',
  'https://cafe-aura-lovat.vercel.app',
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_ADMIN_URL,
].filter(Boolean) as string[];

// Public web paths that unauthenticated users are allowed to access
const PUBLIC_WEB_PATHS = ['/login', '/forgot-password', '/unauthorized'];

// Public API endpoints
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
  '/api/health',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Static files & Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.mp4') ||
    pathname.endsWith('.webp')
  ) {
    return NextResponse.next();
  }

  // 2. Handle API routes
  if (pathname.startsWith('/api')) {
    // A. Rate Limiting Check
    const isMutatingOrSensitive =
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) ||
      pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/staff') ||
      pathname.startsWith('/api/auth/login');
    const limit = isMutatingOrSensitive ? STRICT_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;
    const rateLimitKey = `${ip}:${pathname.split('/')[2] || 'root'}:${req.method}`;

    const now = Date.now();
    let entry = rateLimitMap.get(rateLimitKey);

    if (!entry || entry.resetTime < now) {
      entry = { count: 1, resetTime: now + WINDOW_MS };
      rateLimitMap.set(rateLimitKey, entry);
    } else {
      entry.count++;
    }

    if (entry.count > limit) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down and try again in a minute.',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // B. CORS Preflight & Headers
    const isAllowedOrigin = origin
      ? ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed)) || origin.endsWith('.vercel.app')
      : true;

    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin && isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, x-user-id, x-user-role, x-user-email, x-user-name'
        );
        response.headers.set('Access-Control-Max-Age', '86400');
      }
      return response;
    }

    // C. Check API Authentication for non-public API endpoints
    const isPublicApi =
      PUBLIC_API_PATHS.some((p) => pathname.startsWith(p)) ||
      (pathname === '/api/menu' && req.method === 'GET') ||
      (pathname === '/api/categories' && req.method === 'GET');

    if (!isPublicApi) {
      const sessionToken =
        req.cookies.get(SESSION_COOKIE_NAME)?.value ||
        (req.headers.get('authorization')?.startsWith('Bearer ')
          ? req.headers.get('authorization')?.substring(7)
          : null);

      const session = await verifySessionToken(sessionToken);
      const hasDevHeaders = req.headers.get('x-user-id') && req.headers.get('x-user-role');

      if (!session && !hasDevHeaders) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required. Please log in.',
            },
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const response = NextResponse.next();

    if (origin && isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limit - entry.count)));

    return response;
  }

  // 3. Web Page Authentication & Security Boundary
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionToken);
  const isAuthenticated = !!session;

  // Handle Root route `/`
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // If user is already authenticated and tries to open /login or /forgot-password
  if (isAuthenticated && (pathname === '/login' || pathname === '/forgot-password')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is NOT authenticated and tries to access ANY protected route
  const isPublicPage = PUBLIC_WEB_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isAuthenticated && !isPublicPage) {
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Global Security Headers for Allowed Web Pages
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
