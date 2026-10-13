import { createError, defineEventHandler, readBody } from 'h3';
import { callAppsScript } from '../utils/appsScript';
import { getSessionToken } from '../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ score?: unknown }>(event);
  const sessionToken = getSessionToken(event);
  const score = Number(body.score);
  if (!sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to save your score.' });
  }
  if (!Number.isSafeInteger(score) || score < 1 || score > 10_000_000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid win score.' });
  }

  return callAppsScript(event, 'addScore', { sessionToken, score });
});