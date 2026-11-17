// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Tela Entrar", () => {
  test("com a senha errada, avisa abaixo da Senha, limpa a senha, foca a Senha e mantém o e-mail", async ({
    page,
    person,
  }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(person.email);
    await page.getByLabel("Senha").fill("senha-errada-1");

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page.getByLabel("Senha")).toHaveValue("");
    await expect(page.getByLabel("Senha")).toBeFocused();
    await expect(page.getByLabel("E-mail")).toHaveValue(person.email);
    await expect(page.getByLabel("Senha")).toHaveAccessibleDescription("E-mail ou senha incorretos.");
  });
});
