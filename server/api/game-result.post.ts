import { createError, defineEventHandler, readBody } from 'h3';
import { callAppsScript } from '../utils/appsScript';
import { getSessionToken } from '../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    won?: unknown;
    score?: unknown;
    dailyWinDate?: unknown;
    todayDate?: unknown;
  }>(event);
  const sessionToken = getSessionToken(event);
  if (!sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to save your game stats.' });
  }
  if (typeof body.won !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid game result.' });
  }

  const score = Number(body.score);
  if (
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > 10_000_000 ||
    (body.won && score < 1) ||
    (!body.won && score !== 0)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid game score.' });
  }
  if (
    typeof body.todayDate !== 'string' ||
    (body.dailyWinDate !== undefined && typeof body.dailyWinDate !== 'string')
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid game date.' });
  }

  return callAppsScript(event, 'recordGame', {
    sessionToken,
    won: body.won,
    score,
    dailyWinDate: body.dailyWinDate ?? '',
    todayDate: body.todayDate,
  });
});
