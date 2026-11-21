// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, expectGeral, test } from "../fixtures";

test.describe("Entrar com e-mail e senha", () => {
  test("entra só pelo teclado: Tab percorre os campos e o botão, e Enter envia", async ({ page, person }) => {
    await page.goto("/entrar");
    // O foco inicial vem na hidratação; digitar antes dela manda as teclas para a página.
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await page.keyboard.type(person.email);
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Senha")).toBeFocused();
    await page.keyboard.type(person.password);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Entrar" })).toBeFocused();

    await page.keyboard.press("Enter");

    await expectGeral(page);
  });
});
