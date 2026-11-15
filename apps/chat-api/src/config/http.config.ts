import { registerAs } from '@nestjs/config';
import { loadEnv } from './env.schema.js';

export const httpConfig = registerAs('http', () => ({
  port: loadEnv().PORT,
}));
