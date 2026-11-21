// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expectGeral, test } from "../fixtures";

test.describe("#geral", () => {
  test("a página inicial leva ao #geral", async ({ loggedInPage: page }) => {
    await page.goto("/");

    await expectGeral(page);
  });
});
