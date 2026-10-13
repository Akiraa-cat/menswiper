import { defineEventHandler } from 'h3';
import { getAccountSession } from '../../utils/account';

export default defineEventHandler((event) => ({ username: getAccountSession(event) }));