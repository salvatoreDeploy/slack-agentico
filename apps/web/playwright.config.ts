import { defineConfig, devices } from "@playwright/test";

// Configuração da suíte de ponta a ponta (apps/web/AGENTS.md, "Testes de ponta a ponta"). Roda no
// contêiner e2e, contra o ambiente já de pé: sem webServer. Os valores que repetem o padrão do
// Playwright ficam explícitos porque são decisões do projeto.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      // O viewport fica aqui porque o do dispositivo sobrescreveria o do `use` global.
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
});
