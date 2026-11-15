import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.schema.js';

export const httpConfig = registerAs('http', () => ({
  port: validateEnv(process.env).PORT,
}));
