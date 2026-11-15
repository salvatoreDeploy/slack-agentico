import { defineConfig, mergeConfig } from 'vitest/config';
import databaseConfig from './vitest.config.database.js';

export default mergeConfig(
  databaseConfig,
  defineConfig({ test: { include: ['src/**/*.int-spec.ts'] } }),
);
