import { defineConfig, devices } from "@playwright/test";

// Configuração da suíte de ponta a ponta (apps/web/AGENTS.md, "Testes de ponta a ponta"). Roda no
// contêiner e2e, contra o ambiente já de pé: sem webServer.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
});
