// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Tela Entrar", () => {
  test("quando o envio falha, avisa entre a Senha e o botão, com role alert, mantendo os campos", async ({
    page,
    person,
  }) => {
    await page.goto("/entrar");
    // O envio da Server Action cai, como numa queda de rede.
    await page.route("**/entrar**", (route) =>
      route.request().method() === "POST" ? route.abort("failed") : route.continue(),
    );
    await page.getByLabel("E-mail").fill(person.email);
    await page.getByLabel("Senha").fill(person.password);

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "Não foi possível" })).toHaveText(
      "Não foi possível entrar agora. Confira sua conexão e tente de novo.",
    );
    await expect(page.getByLabel("E-mail")).toHaveValue(person.email);
    await expect(page).toHaveURL("/entrar");
  });
});
