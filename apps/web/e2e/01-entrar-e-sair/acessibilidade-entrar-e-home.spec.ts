// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, expectGeral, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("a tela Entrar não tem violações do axe-core", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByLabel("E-mail")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("a Home, que leva ao #geral, não tem violações do axe-core", async ({ loggedInPage: page }) => {
    await expectGeral(page);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
