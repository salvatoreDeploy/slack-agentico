// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, signOut, test } from "../fixtures";

test.describe("Sair", () => {
  test("depois de sair numa aba, a outra vai para Entrar na próxima ação", async ({
    loggedInPage: page,
    person,
  }) => {
    const otherTab = await page.context().newPage();
    await otherTab.goto("/");
    await expect(otherTab.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
    await signOut(page, person);
    await expect(page).toHaveURL("/entrar");

    await otherTab.reload();

    await expect(otherTab).toHaveURL(/\/entrar/);
  });
});
