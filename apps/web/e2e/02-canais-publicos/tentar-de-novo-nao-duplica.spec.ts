// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, failSends, failureOf, historyOf, openChannel, retryOf, sendFromComposer, test } from "../fixtures";

test.describe("Falha no envio", () => {
  test("Tentar de novo não duplica a Mensagem que a API gravou mas cuja resposta se perdeu", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    const { release } = await failSends(page, channel, { afterReaching: true });
    const item = await sendFromComposer(page, channel, "gravada uma vez");
    await expect(failureOf(item)).toBeVisible();
    release();
    await retryOf(item).click();
    await expect(item).not.toHaveAttribute("aria-busy");
    await expect(failureOf(item)).toHaveCount(0);

    await page.reload();

    await expect(page.getByRole("heading", { level: 1, name: channel.name })).toBeVisible();
    await expect(historyOf(page, channel).getByRole("listitem").filter({ hasText: "gravada uma vez" })).toHaveCount(1);
  });
});
