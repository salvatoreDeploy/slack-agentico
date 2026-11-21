// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, findGeneralChannelId, test } from "../fixtures";

test.describe("Sessão no cliente", () => {
  test("com a Sessão válida, o endereço de Sessão inválida não tira a Pessoa do chat", async ({
    loggedInPage: page,
    person,
    database,
  }) => {
    const channelPath = `/canais/${await findGeneralChannelId(database)}?aba=conversas`;
    await page.goto(`/api/sessao/expirada?voltar=${encodeURIComponent(channelPath)}`);

    await expect(page).toHaveURL(channelPath);
    await expect(page.getByRole("button", { name: `Menu de ${person.name}` })).toBeVisible();
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "session")).toBeDefined();
  });
});
