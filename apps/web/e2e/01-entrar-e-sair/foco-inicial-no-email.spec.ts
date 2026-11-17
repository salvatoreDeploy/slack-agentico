// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Tela Entrar", () => {
  test("abre com o foco no E-mail", async ({ page }) => {
    await page.goto("/entrar");

    await expect(page.getByLabel("E-mail")).toBeFocused();
  });
});
