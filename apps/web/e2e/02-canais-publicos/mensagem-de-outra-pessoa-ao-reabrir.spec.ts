// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, insertMessage, openChannel, test } from "../fixtures";

test.describe("Histórico", () => {
  test("a Mensagem de outra Pessoa aparece ao reabrir o Canal pela barra lateral", async ({
    loggedInPage: page,
    otherPerson,
    testChannel: channel,
    database,
  }) => {
    await openChannel(page, channel);
    await insertMessage(database, { channelId: channel.id, authorId: otherPerson.id, body: "chegou depois" });
    await expect(page.getByText("chegou depois")).toHaveCount(0);
    const sidebar = page.getByRole("complementary", { name: "Conversas" });

    await sidebar.getByRole("link", { name: "geral", exact: true }).click();
    await sidebar.getByRole("link", { name: channel.name, exact: true }).click();

    await expect(page.getByRole("listitem").filter({ hasText: "chegou depois" })).toContainText(otherPerson.name);
  });
});
