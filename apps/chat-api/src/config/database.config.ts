import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.schema.js';

export const databaseConfig = registerAs('database', () => ({
  url: validateEnv(process.env).DATABASE_URL,
}));
