import { createError, type H3Event } from 'h3';

interface AppsScriptResponse {
  ok: boolean;
  error?: string;
  username?: string;
  score?: number;
  entries?: { username: string; score: number; rank: number }[];
}

const ERROR_STATUS: Record<string, number> = {
  INVALID_USERNAME: 400,
  INVALID_PASSWORD: 400,
  USERNAME_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_NOT_FOUND: 401,
  UNAUTHORIZED: 401,
  INVALID_SCORE: 400,
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_USERNAME: 'Username must be 3-24 letters, numbers, or underscores.',
  INVALID_PASSWORD: 'Password must be 8-128 characters.',
  USERNAME_TAKEN: 'That username is already in use.',
  INVALID_CREDENTIALS: 'Username or password is incorrect.',
  ACCOUNT_NOT_FOUND: 'Account no longer exists.',
  INVALID_SCORE: 'Invalid win score.',
  UNAUTHORIZED: 'Apps Script shared secret does not match.',
  TRY_AGAIN: 'The service is busy. Please try again.',
};

export async function callAppsScript(
  event: H3Event,
  action: string,
  values: Record<string, string | number> = {}
) {
  const config = useRuntimeConfig(event);
  if (!config.appsScriptUrl || !config.appsScriptSharedSecret) {
    throw createError({ statusCode: 503, statusMessage: 'Apps Script URL and shared secret are not configured.' });
  }

  let result: AppsScriptResponse;
  try {
    result = await $fetch<AppsScriptResponse>(config.appsScriptUrl, {
      method: 'POST',
      body: { action, secret: config.appsScriptSharedSecret, ...values },
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not reach the Apps Script web app.' });
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