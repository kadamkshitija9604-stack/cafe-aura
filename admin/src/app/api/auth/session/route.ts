import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { AdminUser } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value ||
                  (req.headers.get('authorization')?.startsWith('Bearer ') ? req.headers.get('authorization')?.substring(7) : null);

    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      }, { status: 401 });
    }

    const user: AdminUser = {
      uid: session.uid,
      email: session.email,
      displayName: session.displayName,
      role: session.role,
      status: session.status,
      photoURL: session.photoURL,
      providerId: 'password',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    }, { status: 401 });
  }
}
