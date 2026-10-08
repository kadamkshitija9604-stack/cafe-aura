// Cryptographically signed session tokens using Web Crypto API (Edge & Node compatible)
import { Role } from '@/types/rbac';
import { AdminUser, UserStatus } from '@/types/user';

const SESSION_COOKIE_NAME = 'cafe_aura_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const SECRET_KEY = process.env.SESSION_SECRET || 'cafe-aura-enterprise-session-secret-salt-2026-v1';

export interface SessionPayload {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  photoURL?: string;
  exp: number; // Unix epoch in ms
}

function base64UrlEncode(str: string): string {
  if (typeof btoa === 'function') {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  if (typeof atob === 'function') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a tamper-proof signed session token.
 */
export async function createSessionToken(user: AdminUser): Promise<string> {
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    photoURL: user.photoURL,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(encodedPayload)
  );

  const signatureBytes = Array.from(new Uint8Array(signatureBuffer));
  const signatureBinary = String.fromCharCode(...signatureBytes);
  const encodedSignature = base64UrlEncode(signatureBinary);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies the signed session token and returns the payload if valid and unexpired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();

    // Decode signature
    const signatureBinary = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBinary.split('').map(c => c.charCodeAt(0)));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(encodedPayload)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
