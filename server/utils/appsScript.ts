import { createError, type H3Event } from 'h3';

interface AppsScriptResponse {
  ok: boolean;
  error?: string;
  username?: string;
  sessionToken?: string;
  score?: number;
  entries?: { username: string; score: number; rank: number }[];
  stats?: {
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    dailyWinDates: string[];
  };
  streak?: number;
}

const ERROR_STATUS: Record<string, number> = {
  INVALID_USERNAME: 400,
  INVALID_PASSWORD: 400,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_NOT_FOUND: 401,
  INVALID_SESSION: 401,
  INVALID_SCORE: 400,
  INVALID_DATE: 400,
  INVALID_STATS_DATA: 502,
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_USERNAME: 'Username must be 3-24 letters, numbers, or underscores.',
  INVALID_PASSWORD: 'Password must be 8-128 characters.',
  USERNAME_TAKEN: 'That username is already in use.',
  INVALID_CREDENTIALS: 'Username or password is incorrect.',
  ACCOUNT_NOT_FOUND: 'Account no longer exists.',
  INVALID_SESSION: 'Your session expired. Please sign in again.',
  INVALID_SCORE: 'Invalid win score.',
  INVALID_DATE: 'Invalid game date.',
  INVALID_STATS_DATA: 'Stored game statistics are invalid.',
  TRY_AGAIN: 'The service is busy. Please try again.',
};

export async function callAppsScript(
  event: H3Event,
  action: string,
  values: Record<string, string | number | boolean> = {}
) {
  const config = useRuntimeConfig(event);
  if (!config.appsScriptUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Apps Script URL is not configured.' });
  }

  let result: AppsScriptResponse;
  try {
    result = await $fetch<AppsScriptResponse>(config.appsScriptUrl, {
      method: 'POST',
      body: { action, ...values },
    });
  } catch (error) {
    const upstreamStatus = typeof error === 'object' && error !== null && 'response' in error
      ? (error.response as { status?: number }).status
      : undefined;
    throw createError({
      statusCode: 502,
      statusMessage: upstreamStatus === 401
        ? 'Apps Script returned 401. Set Web App access to Anyone and deploy a new version.'
        : 'Could not reach the Apps Script web app.',
    });
  }

  if (!result.ok) {
    const error = result.error ?? 'APPS_SCRIPT_ERROR';
    throw createError({
      statusCode: ERROR_STATUS[error] ?? 502,
      statusMessage: ERROR_MESSAGES[error] ?? 'Apps Script request failed.',
    });
  }

  return result;
}