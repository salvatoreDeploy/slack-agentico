// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { CHANNEL_ID_PATTERN, expect, signOut, test } from "../fixtures";

test.describe("Sair", () => {
  test("voltar pelo histórico depois de sair não mostra o chat", async ({ loggedInPage: page, person }) => {
    const home = await page.reload();
    expect(home?.headers()["cache-control"]).toContain("no-store");
    await signOut(page, person);
    await expect(page).toHaveURL("/entrar");

    await page.goBack();

    // A página anterior é o #geral, que sem Sessão vai para Entrar com o voltar dele.
    await expect(page).toHaveURL(new RegExp(`/entrar\\?voltar=%2Fcanais%2F${CHANNEL_ID_PATTERN}$`));
    await expect(page.getByRole("heading", { name: "Entrar no Full Cycle" })).toBeVisible();
    await expect(page.getByRole("button", { name: `Menu de ${person.name}` })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Seções" })).toHaveCount(0);
  });
});
