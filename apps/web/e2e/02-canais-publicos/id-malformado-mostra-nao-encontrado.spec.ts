// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expectNotFound, test } from "../fixtures";

test.describe("Conversa não encontrada", () => {
  test("um id malformado mostra o mesmo aviso", async ({ loggedInPage: page }) => {
    await page.goto("/canais/nao-e-um-id");

    await expectNotFound(page);
  });
});
