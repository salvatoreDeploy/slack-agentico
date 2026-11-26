// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("mostra a dica e, enquanto a Pessoa digita, a prévia do nome", async ({ loggedInPage: page }) => {
    const dialog = await openCreateChannel(page);
    await expect(dialog.getByText("Minúsculas, sem espaços. Ex.: planejamento-q4")).toBeVisible();

    await dialog.getByLabel("Nome").fill("Café & Vendas");

    await expect(dialog.getByText("O canal vai se chamar #cafe-vendas.")).toBeVisible();
  });
});
