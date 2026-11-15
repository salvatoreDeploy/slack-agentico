import { defineConfig } from 'vitest/config';

/** Base das suítes que sobem contra o chat_test: e2e e integração. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    globalSetup: ['./test/support/global-setup.ts'],
    setupFiles: ['./test/support/use-test-database.ts'],
  },
});
