// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Entrar com e-mail e senha", () => {
  test("quem tem Sessão e abre a tela Entrar vai para a Home", async ({ loggedInPage: page }) => {
    await page.goto("/entrar");

    await expect(page).toHaveURL("/");
  });
});
