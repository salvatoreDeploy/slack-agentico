// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, test } from "../fixtures";

test.describe("Enviar Mensagem", () => {
  test("a Mensagem enviada aparece uma vez só ao voltar ao Canal, pela barra lateral e pelo histórico", async ({
    loggedInPage: page,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    await composerOf(page, channel).fill("só uma vez");
    await composerOf(page, channel).press("Enter");
    const sent = page.getByRole("listitem").filter({ hasText: "só uma vez" });
    await expect(sent).not.toHaveAttribute("aria-busy");
    const sidebar = page.getByRole("complementary", { name: "Conversas" });

    await sidebar.getByRole("link", { name: "geral", exact: true }).click();
    await sidebar.getByRole("link", { name: channel.name, exact: true }).click();

    await expect(page.getByRole("heading", { level: 1, name: channel.name })).toBeVisible();
    await expect(sent).toHaveCount(1);
    await sidebar.getByRole("link", { name: "geral", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "geral" })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1, name: channel.name })).toBeVisible();
    await expect(sent).toHaveCount(1);
  });
});
