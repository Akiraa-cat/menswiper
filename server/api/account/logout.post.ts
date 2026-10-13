import { defineEventHandler } from 'h3';
import { callAppsScript } from '../../utils/appsScript';
import { clearSessionCookie, getSessionToken } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const sessionToken = getSessionToken(event);
  clearSessionCookie(event);
  if (sessionToken) {
    try {
      await callAppsScript(event, 'logout', { sessionToken });
    } catch {
      // The browser session is cleared even if Apps Script is temporarily unavailable.
    }
  }
  return { ok: true };
});