// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { addChannelButton, expect, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("Esc fecha o diálogo e devolve o foco a Adicionar canal", async ({ loggedInPage: page }) => {
    const dialog = await openCreateChannel(page);

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(addChannelButton(page)).toBeFocused();
  });
});
