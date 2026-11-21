// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { expect, expectGeral, test } from "../fixtures";

async function expectNotFound(page: Page): Promise<void> {
  await expect(page.getByRole("complementary", { name: "Conversas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conversa não encontrada" })).toBeVisible();
  await expect(page.getByText("Ela não existe ou você não participa dela.")).toBeVisible();
  await expect(page).toHaveTitle("Conversa não encontrada · Full Cycle Chat");
}

test.describe("Conversa não encontrada", () => {
  test("um Canal que não existe mostra o aviso e volta ao #geral", async ({ loggedInPage: page }) => {
    await page.goto(`/canais/${randomUUID()}`);
    await expectNotFound(page);

    await page.getByRole("link", { name: "Voltar ao início" }).click();

    await expectGeral(page);
  });
});
