import { defineEventHandler } from 'h3';
import { clearAccountSession } from '../../utils/account';

export default defineEventHandler((event) => {
  clearAccountSession(event);
  return { ok: true };
});