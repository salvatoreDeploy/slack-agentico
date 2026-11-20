// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChangePassword, signIn, signOut, test } from "../fixtures";

const NEW_PASSWORD = "senha-nova-segura-1";

test.describe("Trocar senha", () => {
  test("troca a senha, mostra o toast, devolve o foco ao avatar e a senha nova passa a entrar", async ({
    loggedInPage: page,
    person,
  }) => {
    await openChangePassword(page, person);
    await page.getByLabel("Senha atual").fill(person.password);
    await page.getByLabel("Senha nova").fill(NEW_PASSWORD);

    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText("Senha trocada. Você saiu dos outros navegadores.")).toBeVisible();
    await expect(page.getByRole("button", { name: `Menu de ${person.name}` })).toBeFocused();
    await signOut(page, person);
    await expect(page).toHaveURL("/entrar");
    await signIn(page, { ...person, password: NEW_PASSWORD });
    await expect(page).toHaveURL("/");
  });
});
