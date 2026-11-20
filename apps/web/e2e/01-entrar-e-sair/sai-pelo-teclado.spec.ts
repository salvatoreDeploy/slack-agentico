// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Sair", () => {
  test("sai só pelo teclado", async ({ loggedInPage: page, person }) => {
    await page.getByRole("button", { name: `Menu de ${person.name}` }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Sair do Full Cycle" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/entrar");
  });
});
