import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (session) {
      try {
        const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await query(
          `INSERT INTO audit_logs (id, user_id, user_name, user_email, user_role, action, resource_type, details, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            logId,
            session.uid,
            session.displayName,
            session.email,
            session.role,
            'AUTH_LOGOUT',
            'auth',
            `Administrator signed out (${session.email})`,
          ]
        );
      } catch (_) {}
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
  }
}
