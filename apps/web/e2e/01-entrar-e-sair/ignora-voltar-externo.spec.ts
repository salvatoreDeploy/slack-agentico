// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, signIn, test } from "../fixtures";

test.describe("Volta à página pedida", () => {
  for (const voltar of ["//outro-site.example", "/%09/outro-site.example", "/%5Coutro-site.example"]) {
    test(`ignora o voltar ${voltar}, que aponta para fora do produto, e cai na Home`, async ({ page, person }) => {
      await page.goto(`/entrar?voltar=${voltar}`);

      await signIn(page, person);

      await expect(page).toHaveURL("/");
    });
  }
});
