// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { blockLogin, expect, openChangePassword, test } from "../fixtures";

test.describe("Trocar senha", () => {
  test("com o e-mail bloqueado, avisa no corpo do diálogo, mantendo os campos", async ({
    loggedInPage: page,
    person,
    database,
  }) => {
    await blockLogin(database, person.email);
    await openChangePassword(page, person);
    await page.getByLabel("Senha atual").fill(person.password);
    await page.getByLabel("Senha nova").fill("senha-nova-segura-1");

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
      "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
    );
    await expect(page.getByLabel("Senha atual")).toHaveValue(person.password);
    await expect(page.getByLabel("Senha nova")).toHaveValue("senha-nova-segura-1");
  });
});
