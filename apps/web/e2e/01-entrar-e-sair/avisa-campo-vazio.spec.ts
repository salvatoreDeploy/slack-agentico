// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Tela Entrar", () => {
  test("avisa os campos vazios sem enviar e põe o foco no primeiro inválido", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("Senha").focus();

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    await expect(page.getByText("Informe sua senha.")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL("/entrar");
  });
});
