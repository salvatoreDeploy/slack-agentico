// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Barra lateral", () => {
  test("mostra a seção Canais com o #geral selecionado", async ({ loggedInPage: page }) => {
    const channels = page.getByRole("complementary", { name: "Conversas" }).getByRole("region", { name: "Canais" });

    await expect(channels.getByRole("heading", { name: "Canais" })).toBeVisible();
    await expect(channels.getByRole("link", { name: "geral", exact: true })).toHaveAttribute("aria-current", "page");
  });
});
