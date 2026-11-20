// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChangePassword, test } from "../fixtures";

test.describe("Trocar senha", () => {
  test("com a senha nova igual à atual, avisa abaixo da Senha nova", async ({ loggedInPage: page, person }) => {
    await openChangePassword(page, person);
    await page.getByLabel("Senha atual").fill(person.password);
    await page.getByLabel("Senha nova").fill(person.password);

    await page.getByRole("button", { name: "Salvar" }).click();

    const next = page.getByLabel("Senha nova");
    await expect(next).toHaveAccessibleDescription("A senha nova tem de ser diferente da atual.");
    await expect(next).toHaveAttribute("aria-invalid", "true");
  });
});
