// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { expect, expectNotFound, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("o #geral vazio não tem violações do axe-core", async ({ loggedInPage: page }) => {
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test("a Conversa não encontrada não tem violações do axe-core", async ({ loggedInPage: page }) => {
    await page.goto(`/canais/${randomUUID()}`);
    await expectNotFound(page);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
