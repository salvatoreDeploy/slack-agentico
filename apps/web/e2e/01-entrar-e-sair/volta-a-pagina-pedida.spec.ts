// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import { expect, findGeneralChannelId, signIn, test } from "../fixtures";

test.describe("Volta à página pedida", () => {
  test("sem Sessão, vai para Entrar com o voltar e, depois de entrar, cai na página pedida", async ({ page, person, database }) => {
    const channelPath = `/canais/${await findGeneralChannelId(database)}?aba=conversas`;
    await page.goto(channelPath);

    await expect(page).toHaveURL(`/entrar?voltar=${encodeURIComponent(channelPath)}`);
    await signIn(page, person);
    await expect(page).toHaveURL(channelPath);
  });
});
