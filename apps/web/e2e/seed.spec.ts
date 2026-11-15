import { expect, test } from "@playwright/test";

// Teste-semente: o ponto de partida de toda sessão de planejar e gerar testes com a skill
// playwright-cli (apps/web/AGENTS.md, "Testes de ponta a ponta").
test("seed", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Full Cycle Chat");
});
