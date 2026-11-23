import { defineConfig } from "vitest/config";

/**
 * Testes de unidade das funções puras da web, em Node e sem DOM (LLD, "Estrutura do código"). As
 * telas são provadas pelo Playwright.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
