import { defineEventHandler } from 'h3';
import { callAppsScript } from '../../utils/appsScript';
import { getSessionToken } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const sessionToken = getSessionToken(event);
  if (!sessionToken) return { username: null };
  try {
    const result = await callAppsScript(event, 'session', { sessionToken });
    return { username: result.username || null };
  } catch {
    return { username: null };
  }
});