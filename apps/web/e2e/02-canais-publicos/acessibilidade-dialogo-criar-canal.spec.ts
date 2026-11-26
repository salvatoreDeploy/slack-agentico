// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, openCreateChannel, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("o diálogo Criar canal, com a prévia, não tem violações do axe-core", async ({ loggedInPage: page }) => {
    const dialog = await openCreateChannel(page);
    await dialog.getByLabel("Nome").fill("Café & Vendas");
    await expect(dialog.getByText("O canal vai se chamar #cafe-vendas.")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("o diálogo Criar canal, com um erro no campo, não tem violações do axe-core", async ({
    loggedInPage: page,
  }) => {
    const dialog = await openCreateChannel(page);
    await dialog.getByRole("button", { name: "Criar canal" }).click();
    await expect(dialog.getByText("Informe o nome do canal.")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
