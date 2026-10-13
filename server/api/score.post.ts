import { createError, defineEventHandler, readBody } from 'h3';
import { requireAccountSession } from '../utils/account';
import { callAppsScript } from '../utils/appsScript';

export default defineEventHandler(async (event) => {
  const username = requireAccountSession(event);
  const body = await readBody<{ score?: unknown }>(event);
  const score = Number(body.score);
  if (!Number.isSafeInteger(score) || score < 1 || score > 10_000_000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid win score.' });
  }

  return callAppsScript(event, 'addScore', { username, score });
});