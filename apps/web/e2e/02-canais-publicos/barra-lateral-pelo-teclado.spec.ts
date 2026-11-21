// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { randomUUID } from "node:crypto";
import { expect, expectGeral, test } from "../fixtures";

test.describe("Barra lateral", () => {
  test("o #geral abre pelo teclado", async ({ loggedInPage: page }) => {
    await page.goto(`/canais/${randomUUID()}`);
    const geral = page.getByRole("link", { name: "geral", exact: true });

    for (let i = 0; i < 10 && !(await geral.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(geral).toBeFocused();
    await expect(geral).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");

    await expectGeral(page);
  });
});
