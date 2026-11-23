// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, routeSend, test } from "../fixtures";

test.describe("Falha no envio", () => {
  test("a Mensagem fica não enviada com o texto, e Tentar de novo a envia", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    let isOffline = true;
    await routeSend(page, channel, (route) => (isOffline ? route.abort() : route.continue()));
    await composerOf(page, channel).fill("vai falhar primeiro");
    await composerOf(page, channel).press("Enter");
    const item = page.getByRole("listitem").filter({ hasText: "vai falhar primeiro" });
    await expect(item.getByText("Não foi possível enviar.")).toBeVisible();
    isOffline = false;

    await item.getByRole("button", { name: "Tentar de novo" }).click();

    await expect(item).not.toHaveAttribute("aria-busy");
    await expect(item.getByText("Não foi possível enviar.")).toHaveCount(0);
    await expect(item.getByRole("button", { name: "Tentar de novo" })).toHaveCount(0);
  });
});
