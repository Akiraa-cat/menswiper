import { createHmac, timingSafeEqual } from 'node:crypto';
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3';

const SESSION_COOKIE = 'minesweeper_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(event: H3Event) {
  const secret = useRuntimeConfig(event).sessionSecret;
  if (typeof secret !== 'string' || secret.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Session secret must be configured with at least 32 characters.' });
  }
  return secret;
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function setAccountSession(event: H3Event, username: string) {
  const secret = getSessionSecret(event);
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  })).toString('base64url');
  const token = `${payload}.${sign(payload, secret)}`;
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAccountSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

export function getAccountSession(event: H3Event): string | null {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload, getSessionSecret(event));
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      username?: unknown;
      expiresAt?: unknown;
    };
    if (typeof data.username !== 'string' || typeof data.expiresAt !== 'number' || data.expiresAt <= Date.now()) {
      return null;
    }
    return data.username;
  } catch {
    return null;
  }
}

export function requireAccountSession(event: H3Event) {
  const username = getAccountSession(event);
  if (!username) throw createError({ statusCode: 401, statusMessage: 'Sign in to continue.' });
  return username;
}