// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Sessão no navegador todo", () => {
  test("uma segunda aba do mesmo navegador já abre com Sessão", async ({ loggedInPage: page, person }) => {
    const secondTab = await page.context().newPage();

    await secondTab.goto("/");

    await expect(secondTab.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
  });
});
