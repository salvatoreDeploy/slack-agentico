// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Sessão no navegador todo", () => {
  test("o navegador reaberto, com o estado guardado, continua com Sessão", async ({
    loggedInPage: page,
    person,
    browser,
  }) => {
    const storageState = await page.context().storageState();
    await page.context().close();
    const reopened = await browser.newContext({ storageState });
    const reopenedPage = await reopened.newPage();

    await reopenedPage.goto("/");

    await expect(reopenedPage.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
    await reopened.close();
  });
});
