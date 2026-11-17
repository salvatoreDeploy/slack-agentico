// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, signIn, test } from "../fixtures";

test.describe("Volta à página pedida", () => {
  test("sem Sessão, vai para Entrar com o voltar e, depois de entrar, cai na página pedida", async ({ page, person }) => {
    await page.goto("/?aba=conversas");

    await expect(page).toHaveURL("/entrar?voltar=%2F%3Faba%3Dconversas");
    await signIn(page, person);
    await expect(page).toHaveURL("/?aba=conversas");
  });
});
