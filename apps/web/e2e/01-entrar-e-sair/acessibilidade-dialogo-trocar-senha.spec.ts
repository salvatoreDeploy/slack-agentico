// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, openChangePassword, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("o diálogo Trocar senha não tem violações do axe-core", async ({ loggedInPage: page, person }) => {
    await openChangePassword(page, person);

    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();

    expect(results.violations).toEqual([]);
  });
});
