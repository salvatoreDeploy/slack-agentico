// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, historyOf, insertMessage, ONE_DAY_MS, openChannel, test } from "../fixtures";

const TIME_ZONE = "America/Sao_Paulo";
test.use({ timezoneId: TIME_ZONE });

/** O horário como a tela deve mostrar, no fuso fixado do navegador. */
function expectedTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(date);
}

test.describe("Histórico", () => {
  test("mostra autor, horário e os separadores de dia, rolado até o fim", async ({
    loggedInPage: page,
    person,
    otherPerson,
    testChannel: channel,
    database,
  }) => {
    const yesterday = new Date(Date.now() - ONE_DAY_MS);
    const today = new Date(Date.now() - 60 * 1000);
    await insertMessage(database, { channelId: channel.id, authorId: otherPerson.id, body: "mensagem de ontem", createdAt: yesterday });
    await insertMessage(database, { channelId: channel.id, authorId: person.id, body: "mensagem de hoje", createdAt: today });

    await openChannel(page, channel);

    const list = historyOf(page, channel);
    const items = list.getByRole("listitem");
    await expect(list.getByRole("separator")).toHaveText(["Ontem", "Hoje"]);
    const old = items.filter({ hasText: "mensagem de ontem" });
    await expect(old).toContainText(otherPerson.name);
    await expect(old.locator("time")).toHaveText(expectedTime(yesterday));
    const latest = items.filter({ hasText: "mensagem de hoje" });
    await expect(latest).toContainText(person.name);
    await expect(latest.locator("time")).toHaveText(expectedTime(today));
    await expect(latest).toBeInViewport();
  });
});
