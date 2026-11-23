// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, routeSend, test } from "../fixtures";

test.describe("Falha no envio", () => {
  test("Tentar de novo funciona pelo teclado e devolve o foco ao composer", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    let isOffline = true;
    await routeSend(page, channel, (route) => (isOffline ? route.abort() : route.continue()));
    const composer = composerOf(page, channel);
    await composer.fill("pelo teclado");
    await composer.press("Enter");
    const item = page.getByRole("listitem").filter({ hasText: "pelo teclado" });
    const retry = item.getByRole("button", { name: "Tentar de novo" });
    await expect(retry).toBeVisible();
    isOffline = false;

    for (let i = 0; i < 10 && !(await retry.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Shift+Tab");
    }
    await expect(retry).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(item.getByText("Não foi possível enviar.")).toHaveCount(0);
    await expect(composer).toBeFocused();
  });
});
