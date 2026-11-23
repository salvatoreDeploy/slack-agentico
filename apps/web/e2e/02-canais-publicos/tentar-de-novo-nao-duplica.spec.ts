// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, routeSend, test } from "../fixtures";

test.describe("Falha no envio", () => {
  test("Tentar de novo não duplica a Mensagem que a API gravou mas cuja resposta se perdeu", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    let isResponseLost = true;
    await routeSend(page, channel, async (route) => {
      if (isResponseLost) {
        await route.fetch();
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await composerOf(page, channel).fill("gravada uma vez");
    await composerOf(page, channel).press("Enter");
    const item = page.getByRole("listitem").filter({ hasText: "gravada uma vez" });
    await expect(item.getByText("Não foi possível enviar.")).toBeVisible();
    isResponseLost = false;
    await item.getByRole("button", { name: "Tentar de novo" }).click();
    await expect(item).not.toHaveAttribute("aria-busy");

    await page.reload();

    await expect(page.getByRole("heading", { level: 1, name: channel.name })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "gravada uma vez" })).toHaveCount(1);
  });
});
