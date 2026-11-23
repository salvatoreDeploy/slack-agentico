// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, historyOf, insertMessage, messageText, openChannel, test } from "../fixtures";

test.describe("Texto da Mensagem", () => {
  test("mantém as quebras de linha e só transforma em link os endereços http e https", async ({
    loggedInPage: page,
    otherPerson,
    testChannel: channel,
    database,
  }) => {
    await insertMessage(database, {
      channelId: channel.id,
      authorId: otherPerson.id,
      body: "primeira linha\nveja https://exemplo.com e exemplo.com",
    });

    await openChannel(page, channel);

    const list = historyOf(page, channel);
    const link = list.getByRole("link", { name: "https://exemplo.com" });
    await expect(link).toHaveAttribute("href", "https://exemplo.com");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(list.getByRole("link")).toHaveCount(1);
    const item = list.getByRole("listitem").filter({ hasText: "primeira linha" });
    expect(await messageText(item)).toBe("primeira linha\nveja https://exemplo.com e exemplo.com");
  });
});
