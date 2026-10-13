import { defineEventHandler } from 'h3';
import { callAppsScript } from '../utils/appsScript';

export default defineEventHandler(async (event) => {
  const result = await callAppsScript(event, 'leaderboard');
  return { entries: result.entries ?? [] };
});