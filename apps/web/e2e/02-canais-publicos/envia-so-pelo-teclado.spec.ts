// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, test } from "../fixtures";

test.describe("Enviar Mensagem", () => {
  test("Tab chega ao composer e Enter envia", async ({ loggedInPage: page, testChannel: channel }) => {
    await openChannel(page, channel);
    const composer = composerOf(page, channel);

    for (let i = 0; i < 15 && !(await composer.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(composer).toBeFocused();
    await page.keyboard.type("pelo teclado");
    await page.keyboard.press("Enter");

    await expect(page.getByRole("listitem").filter({ hasText: "pelo teclado" })).not.toHaveAttribute("aria-busy");
  });
});
