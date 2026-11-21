// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, expectGeral, signIn, test } from "../fixtures";

test.describe("Entrar com e-mail e senha", () => {
  test("entra com e-mail e senha e cai na Home, com o cookie de sessão fora do alcance da página", async ({
    page,
    person,
  }) => {
    await signIn(page, person);

    await expectGeral(page);
    await expect(page.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
    const cookie = (await page.context().cookies()).find((c) => c.name === "session");
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax", path: "/" });
    expect(await page.evaluate(() => document.cookie)).not.toContain("session=");
  });
});
