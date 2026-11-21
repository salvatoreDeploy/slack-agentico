// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChannel, test } from "../fixtures";

test.describe("Enviar Mensagem", () => {
  test("a Mensagem aparece como enviando, o campo fica vazio, e depois ela é confirmada", async ({
    loggedInPage: page,
    person,
    testChannel: channel,
  }) => {
    await openChannel(page, channel);
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(`**/canais/${channel.id}`, async (route) => {
      if (route.request().method() === "POST") {
        await held;
      }
      await route.continue();
    });
    const composer = page.getByRole("textbox", { name: `Mensagem para #${channel.name}` });

    await composer.fill("olá, canal");
    await composer.press("Enter");

    const sent = page.getByRole("listitem").filter({ hasText: "olá, canal" });
    await expect(sent).toHaveAttribute("aria-busy", "true");
    await expect(sent).toHaveCSS("opacity", "0.6");
    await expect(composer).toHaveValue("");
    release();
    await expect(sent).not.toHaveAttribute("aria-busy");
    await expect(sent).toContainText(person.name);
    await expect(sent.locator("time")).toHaveText(/^\d{2}:\d{2}$/);
  });
});
