// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("o nome já usado aparece no campo, com o diálogo aberto e o texto digitado", async ({
    loggedInPage: page,
  }) => {
    const dialog = await openCreateChannel(page);
    const name = dialog.getByLabel("Nome");
    await name.fill("GERAL");

    await dialog.getByRole("button", { name: "Criar canal" }).click();

    await expect(dialog.getByText("Já existe um canal chamado #geral.")).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(name).toHaveValue("GERAL");
    await expect(name).toBeFocused();
  });
});
