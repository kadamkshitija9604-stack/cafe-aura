import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. Handle API routes
  if (pathname.startsWith('/api')) {
    // A. Rate Limiting Check
    const isMutatingOrSensitive = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) || pathname.startsWith('/api/users') || pathname.startsWith('/api/staff');
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
    const isAllowedOrigin = origin ? (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || origin.endsWith('.vercel.app')) : true;

    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin && isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role, x-user-email, x-user-name');
        response.headers.set('Access-Control-Max-Age', '86400');
      }
      return response;
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

  // 2. Global Security Headers for Non-API Web Pages
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
