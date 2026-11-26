// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, test } from "../fixtures";

test.describe("#geral", () => {
  test("mostra o cabeçalho, o título da aba e o começo do Canal", async ({ loggedInPage: page }) => {
    const header = page.getByRole("main").locator("header");
    const intro = page.getByRole("region", { name: "Começo do canal" });

    await expect(header.getByRole("heading", { level: 1 })).toHaveText("geral");
    await expect(header.getByText("Canal de todo o Workspace")).toBeVisible();
    await expect(page).toHaveTitle("#geral · Full Cycle Chat");
    await expect(intro.getByRole("heading", { name: "Este é o começo do canal #geral" })).toBeVisible();
    await expect(intro.getByText("Canal de todo o Workspace")).toBeVisible();
    await expect(intro.getByText(/criou este canal/)).toHaveCount(0);
  });
});
