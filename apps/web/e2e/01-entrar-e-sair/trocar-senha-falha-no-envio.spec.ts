// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChangePassword, test } from "../fixtures";

test.describe("Trocar senha", () => {
  test("quando o envio falha, avisa no corpo do diálogo, mantendo os campos", async ({
    loggedInPage: page,
    person,
  }) => {
    await openChangePassword(page, person);
    // O envio da Server Action cai, como numa queda de rede.
    await page.route("**/*", (route) =>
      route.request().method() === "POST" ? route.abort("failed") : route.continue(),
    );
    await page.getByLabel("Senha atual").fill(person.password);
    await page.getByLabel("Senha nova").fill("senha-nova-segura-1");

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
      "Não foi possível trocar a senha agora. Tente de novo em instantes.",
    );
    await expect(page.getByLabel("Senha atual")).toHaveValue(person.password);
    await expect(page.getByLabel("Senha nova")).toHaveValue("senha-nova-segura-1");
  });
});
