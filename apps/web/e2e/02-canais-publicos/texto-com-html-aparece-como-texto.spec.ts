// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, historyOf, insertMessage, openChannel, test } from "../fixtures";

test.describe("Texto da Mensagem", () => {
  test("uma marcação HTML aparece como texto", async ({ loggedInPage: page, otherPerson, testChannel: channel, database }) => {
    await insertMessage(database, { channelId: channel.id, authorId: otherPerson.id, body: "<b>oi</b> <img src=x>" });

    await openChannel(page, channel);

    const list = historyOf(page, channel);
    await expect(list.getByText("<b>oi</b> <img src=x>")).toBeVisible();
    await expect(list.locator("b, img")).toHaveCount(0);
  });
});
