import { createError, defineEventHandler, getQuery } from 'h3';
import { callAppsScript } from '../../utils/appsScript';
import { getSessionToken } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const sessionToken = getSessionToken(event);
  if (!sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to view your game stats.' });
  }

  const query = getQuery(event);
  const todayDate = typeof query.todayDate === 'string'
    ? query.todayDate
    : new Date().toISOString().slice(0, 10);
  const result = await callAppsScript(event, 'stats', { sessionToken, todayDate });
  if (!result.stats) {
    throw createError({ statusCode: 502, statusMessage: 'Apps Script returned invalid game stats.' });
  }
  return result.stats;
});
