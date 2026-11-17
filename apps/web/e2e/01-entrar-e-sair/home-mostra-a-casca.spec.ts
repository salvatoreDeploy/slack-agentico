// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("Home", () => {
  test("mostra o Rail, a Sidebar com o cabeçalho do Workspace e o estado vazio", async ({ loggedInPage: page }) => {
    const rail = page.getByRole("navigation", { name: "Seções" });
    await expect(rail.getByText("FC")).toBeVisible();
    await expect(rail.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("complementary", { name: "Conversas" }).getByRole("heading")).toHaveText(
      "Full Cycle",
    );
    await expect(page.getByRole("heading", { name: "Nenhuma conversa ainda" })).toBeVisible();
  });
});
