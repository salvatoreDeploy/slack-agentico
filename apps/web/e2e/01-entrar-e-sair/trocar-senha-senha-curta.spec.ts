// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, openChangePassword, test } from "../fixtures";

test.describe("Trocar senha", () => {
  test("com a senha nova curta, avisa abaixo da Senha nova sem enviar", async ({ loggedInPage: page, person }) => {
    await openChangePassword(page, person);
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.getByLabel("Senha atual").fill(person.password);
    await page.getByLabel("Senha nova").fill("curta");

    await page.getByRole("button", { name: "Salvar" }).click();

    const next = page.getByLabel("Senha nova");
    await expect(next).toHaveAccessibleDescription("A senha nova tem de ter de 8 a 128 caracteres.");
    await expect(next).toBeFocused();
    expect(posts).toEqual([]);
  });
});
