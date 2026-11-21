// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, insertMessage, openChannel, test } from "../fixtures";

test.describe("Acessibilidade", () => {
  test("o Canal com Mensagens não tem violações do axe-core", async ({
    loggedInPage: page,
    otherPerson,
    testChannel: channel,
    database,
  }) => {
    await insertMessage(database, {
      channelId: channel.id,
      authorId: otherPerson.id,
      body: "uma Mensagem com https://exemplo.com",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    await insertMessage(database, { channelId: channel.id, authorId: otherPerson.id, body: "outra de hoje" });
    await openChannel(page, channel);
    await expect(page.getByRole("separator", { name: "Hoje" })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
