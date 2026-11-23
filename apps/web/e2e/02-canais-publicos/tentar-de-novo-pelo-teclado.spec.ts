// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import {
  composerOf,
  expect,
  failSends,
  failureOf,
  openChannel,
  retryOf,
  sendFromComposer,
  tabUntilFocused,
  test,
} from "../fixtures";

test.describe("Falha no envio", () => {
  test("Tentar de novo funciona pelo teclado e devolve o foco ao composer", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    const { release } = await failSends(page, channel);
    const item = await sendFromComposer(page, channel, "pelo teclado");
    await expect(retryOf(item)).toBeVisible();
    release();

    await tabUntilFocused(page, retryOf(item), { key: "Shift+Tab", max: 10 });
    await page.keyboard.press("Enter");

    await expect(failureOf(item)).toHaveCount(0);
    await expect(composerOf(page, channel)).toBeFocused();
  });
});
