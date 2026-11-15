import { registerAs } from '@nestjs/config';
import { loadEnv } from './env.schema.js';

export const logConfig = registerAs('log', () => ({
  level: loadEnv().LOG_LEVEL,
}));
