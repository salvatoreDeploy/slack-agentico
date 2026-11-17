// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { deleteSessions, expect, test } from "../fixtures";

test.describe("Sessão no cliente", () => {
  test("com a Sessão apagada, a próxima ação apaga o cookie e manda para Entrar com o voltar", async ({
    loggedInPage: page,
    person,
    database,
  }) => {
    await deleteSessions(database, person);

    await page.goto("/?aba=conversas");

    await expect(page).toHaveURL("/entrar?voltar=%2F%3Faba%3Dconversas");
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "session")).toBeUndefined();
  });
});
