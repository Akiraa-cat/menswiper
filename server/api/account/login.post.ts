import { createError, defineEventHandler, readBody } from 'h3';
import { callAppsScript } from '../../utils/appsScript';
import { setSessionCookie } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown; password?: unknown }>(event);
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!username || password.length < 8 || password.length > 128) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid username and password.' });
  }
  const result = await callAppsScript(event, 'login', { username, password });
  if (!result.username || !result.sessionToken) throw createError({ statusCode: 502, statusMessage: 'Apps Script returned an invalid account response.' });
  setSessionCookie(event, result.sessionToken);
  return { username: result.username };
});