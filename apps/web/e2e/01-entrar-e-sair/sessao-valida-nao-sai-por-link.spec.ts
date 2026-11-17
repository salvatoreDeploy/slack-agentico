// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Sessão no cliente", () => {
  test("com a Sessão válida, o endereço de Sessão inválida não tira a Pessoa do chat", async ({
    loggedInPage: page,
    person,
  }) => {
    await page.goto("/api/sessao/expirada?voltar=%2F%3Faba%3Dconversas");

    await expect(page).toHaveURL("/?aba=conversas");
    await expect(page.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "session")).toBeDefined();
  });
});
