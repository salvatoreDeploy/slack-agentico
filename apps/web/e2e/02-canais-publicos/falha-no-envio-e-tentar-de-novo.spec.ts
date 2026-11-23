// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, failSends, failureOf, openChannel, retryOf, sendFromComposer, test } from "../fixtures";

test.describe("Falha no envio", () => {
  test("a Mensagem fica não enviada com o texto, e Tentar de novo a envia", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    const { release } = await failSends(page, channel);
    const item = await sendFromComposer(page, channel, "vai falhar primeiro");
    await expect(failureOf(item)).toBeVisible();
    release();

    await retryOf(item).click();

    await expect(item).not.toHaveAttribute("aria-busy");
    await expect(failureOf(item)).toHaveCount(0);
    await expect(retryOf(item)).toHaveCount(0);
  });
});
