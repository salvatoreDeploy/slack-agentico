// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Menu do usuário", () => {
  test("abre pelo avatar com o teclado e mostra o nome da Pessoa", async ({ loggedInPage: page, person }) => {
    await page.getByRole("button", { name: `Menu de ${person.name}` }).focus();

    await page.keyboard.press("Enter");

    await expect(page.getByRole("menu")).toContainText(person.name);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  });

  test("abre pelo avatar com o clique", async ({ loggedInPage: page, person }) => {
    await page.getByRole("button", { name: `Menu de ${person.name}` }).click();

    await expect(page.getByRole("menu")).toContainText(person.name);
  });
});
