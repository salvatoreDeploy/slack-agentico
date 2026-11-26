// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("recusa o nome vazio e o sem letras nem números, sem enviar", async ({ loggedInPage: page }) => {
    let sent = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.headers()["next-action"]) {
        sent++;
      }
    });
    const dialog = await openCreateChannel(page);
    const name = dialog.getByLabel("Nome");
    const create = dialog.getByRole("button", { name: "Criar canal" });

    await create.click();

    await expect(dialog.getByText("Informe o nome do canal.")).toBeVisible();
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");

    await name.fill("!!!");
    await create.click();

    await expect(dialog.getByText("Use letras ou números no nome.")).toBeVisible();
    expect(sent).toBe(0);
  });
});
