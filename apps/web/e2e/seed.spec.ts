import { expect, test } from "./fixtures";

// Teste-semente: o ponto de partida de toda sessão de planejar e gerar testes com a skill
// playwright-cli (apps/web/AGENTS.md, "Testes de ponta a ponta"). Abre a tela Entrar com uma
// Pessoa pronta, criada pela fixture `person`.
test("seed", async ({ page, person }) => {
  await page.goto("/entrar");

  await expect(page.getByLabel("E-mail")).toBeVisible();
  expect(person.email).toContain("@");
});
