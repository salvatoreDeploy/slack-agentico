// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { randomUUID } from "node:crypto";
import { expectGeral, expectNotFound, test } from "../fixtures";

test.describe("Conversa não encontrada", () => {
  test("um Canal que não existe mostra o aviso e volta ao #geral", async ({ loggedInPage: page }) => {
    await page.goto(`/canais/${randomUUID()}`);
    await expectNotFound(page);

    await page.getByRole("link", { name: "Voltar ao início" }).click();

    await expectGeral(page);
  });
});
