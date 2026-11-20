// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChangePassword, test } from "../fixtures";

test.describe("Trocar senha", () => {
  test("com a senha atual errada, avisa abaixo da Senha atual e põe o foco nela", async ({
    loggedInPage: page,
    person,
  }) => {
    await openChangePassword(page, person);
    await page.getByLabel("Senha atual").fill("senha-errada-1");
    await page.getByLabel("Senha nova").fill("senha-nova-segura-1");

    await page.getByRole("button", { name: "Salvar" }).click();

    const current = page.getByLabel("Senha atual");
    await expect(current).toHaveAccessibleDescription("Senha atual incorreta.");
    await expect(current).toHaveAttribute("aria-invalid", "true");
    await expect(current).toBeFocused();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
