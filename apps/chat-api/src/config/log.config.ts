import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.schema.js';

export const logConfig = registerAs('log', () => ({
  level: validateEnv(process.env).LOG_LEVEL,
}));
