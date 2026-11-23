// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { randomUUID } from "node:crypto";
import { expect, expectGeral, tabUntilFocused, test } from "../fixtures";

test.describe("Barra lateral", () => {
  test("o #geral abre pelo teclado", async ({ loggedInPage: page }) => {
    await page.goto(`/canais/${randomUUID()}`);
    const geral = page.getByRole("link", { name: "geral", exact: true });

    await tabUntilFocused(page, geral, { max: 10 });
    await expect(geral).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");

    await expectGeral(page);
  });
});
