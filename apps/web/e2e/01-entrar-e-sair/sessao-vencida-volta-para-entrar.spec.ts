// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { ageSessions, expect, test } from "../fixtures";

const THIRTY_DAYS_AND_ONE_MINUTE_MS = (30 * 24 * 60 + 1) * 60 * 1000;

test.describe("Sessão no cliente", () => {
  test("com a Sessão vencida por falta de uso, a próxima ação manda para Entrar com o voltar", async ({
    loggedInPage: page,
    person,
    database,
  }) => {
    await ageSessions(database, person, THIRTY_DAYS_AND_ONE_MINUTE_MS);

    await page.goto("/?aba=conversas");

    await expect(page).toHaveURL("/entrar?voltar=%2F%3Faba%3Dconversas");
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "session")).toBeUndefined();
  });
});
