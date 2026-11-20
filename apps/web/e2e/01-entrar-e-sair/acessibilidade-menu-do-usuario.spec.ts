// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("a Home com o menu do usuário aberto não tem violações do axe-core", async ({
    loggedInPage: page,
    person,
  }) => {
    await page.getByRole("button", { name: `Menu de ${person.name}` }).click();
    await expect(page.getByRole("menuitem", { name: "Sair do Full Cycle" })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
