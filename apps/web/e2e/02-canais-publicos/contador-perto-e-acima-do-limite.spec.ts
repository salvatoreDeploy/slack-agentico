// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { composerOf, expect, openChannel, test } from "../fixtures";

test.describe("Composer", () => {
  test("mostra o contador perto do limite e bloqueia o envio acima dele", async ({ loggedInPage: page, testChannel: channel }) => {
    await openChannel(page, channel);
    const composer = composerOf(page, channel);
    const sendButton = page.getByRole("button", { name: "Enviar mensagem" });

    await composer.fill("👩🏽‍💻".repeat(3801));
    await expect(page.getByText("Restam 199 caracteres")).toBeVisible();
    await expect(sendButton).toBeEnabled();

    await composer.fill("a".repeat(4012));
    await expect(page.getByText("12 caracteres acima do limite")).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });
});
