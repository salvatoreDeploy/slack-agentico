// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expectGeral, signIn, test } from "../fixtures";

test.describe("#geral", () => {
  test("quem entra sem voltar cai no #geral", async ({ page, person }) => {
    await signIn(page, person);

    await expectGeral(page);
  });
});
