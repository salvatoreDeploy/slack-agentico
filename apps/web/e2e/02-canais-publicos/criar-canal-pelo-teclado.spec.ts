// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { addChannelButton, expect, expectChannel, tabUntilFocused, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("cria o Canal só pelo teclado", async ({ loggedInPage: page, createdChannelName: name }) => {
    await tabUntilFocused(page, addChannelButton(page), { max: 30 });
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "Criar canal" }).getByLabel("Nome")).toBeFocused();
    await page.keyboard.type(name);

    await page.keyboard.press("Enter");

    await expectChannel(page, name);
  });
});
