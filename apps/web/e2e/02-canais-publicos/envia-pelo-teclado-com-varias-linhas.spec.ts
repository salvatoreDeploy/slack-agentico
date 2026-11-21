// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChannel, test } from "../fixtures";

test.describe("Enviar Mensagem", () => {
  test("Shift+Enter quebra a linha sem enviar, e Enter envia", async ({ loggedInPage: page, testChannel: channel }) => {
    await openChannel(page, channel);
    const composer = page.getByRole("textbox", { name: `Mensagem para #${channel.name}` });

    await composer.click();
    await page.keyboard.type("linha um");
    await page.keyboard.press("Shift+Enter");
    await page.keyboard.type("linha dois");
    await expect(composer).toHaveValue("linha um\nlinha dois");
    await page.keyboard.press("Enter");

    const sent = page.getByRole("listitem").filter({ hasText: "linha um" });
    await expect(sent).not.toHaveAttribute("aria-busy");
    expect(await sent.locator("p").nth(1).innerText()).toBe("linha um\nlinha dois");
  });
});
