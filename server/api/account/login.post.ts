import { createError, defineEventHandler, readBody } from 'h3';
import { setAccountSession } from '../../utils/account';
import { callAppsScript } from '../../utils/appsScript';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown; password?: unknown }>(event);
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const result = await callAppsScript(event, 'login', { username, password });
  if (!result.username) throw createError({ statusCode: 502, statusMessage: 'Apps Script returned an invalid account response.' });
  setAccountSession(event, result.username);
  return { username: result.username };
});