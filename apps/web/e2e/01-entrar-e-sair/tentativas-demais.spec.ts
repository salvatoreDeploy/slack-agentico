// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { blockLogin, expect, findLoginAttempt, test } from "../fixtures";

const TOO_MANY_ATTEMPTS = "Muitas tentativas de entrar. Aguarde alguns minutos e tente de novo.";

test.describe("Limite de tentativas", () => {
  let blockedEmail: string | undefined;

  test("com o e-mail bloqueado, avisa entre a Senha e o botão, mantendo os campos e o foco", async ({
    page,
    person,
    database,
  }) => {
    blockedEmail = person.email;
    await blockLogin(database, person.email);
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(person.email);
    await page.getByLabel("Senha").fill(person.password);

    await page.getByRole("button", { name: "Entrar" }).click();

    const alert = page.getByRole("alert").filter({ hasText: "Muitas tentativas" });
    await expect(alert).toHaveText(TOO_MANY_ATTEMPTS);
    // Entre a Senha e o botão: o aviso vem depois do campo e antes do botão no formulário.
    const order = await page.locator("form").evaluate((form) =>
      [...form.querySelectorAll("#password, [role=alert], button[type=submit]")].map(
        (el) => el.getAttribute("role") ?? el.tagName.toLowerCase(),
      ),
    );
    expect(order).toEqual(["input", "alert", "button"]);
    await expect(page.getByLabel("E-mail")).toHaveValue(person.email);
    await expect(page.getByLabel("Senha")).toHaveValue(person.password);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeFocused();
    await expect(page).toHaveURL("/entrar");
  });

  test.afterAll(async ({ database }) => {
    // A fixture `person` já foi desmontada aqui: a linha de tentativas do e-mail não pode sobrar.
    expect(blockedEmail).toBeDefined();
    expect(await findLoginAttempt(database, blockedEmail!)).toBeUndefined();
  });
});
