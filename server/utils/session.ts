import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3';

const SESSION_COOKIE = 'minesweeper_session';
const SESSION_TTL_SECONDS = 60 * 60 * 6;

export function setSessionCookie(event: H3Event, token: string) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function getSessionToken(event: H3Event) {
  return getCookie(event, SESSION_COOKIE) ?? '';
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}