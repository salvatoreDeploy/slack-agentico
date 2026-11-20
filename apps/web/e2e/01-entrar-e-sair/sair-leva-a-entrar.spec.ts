// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, findSessions, signOut, test } from "../fixtures";

test.describe("Sair", () => {
  test("sair leva a Entrar, apaga o cookie e a Sessão", async ({ loggedInPage: page, person, database }) => {
    await signOut(page, person);

    await expect(page).toHaveURL("/entrar");
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "session")).toBeUndefined();
    expect(await findSessions(database, person)).toEqual([]);
  });
});
