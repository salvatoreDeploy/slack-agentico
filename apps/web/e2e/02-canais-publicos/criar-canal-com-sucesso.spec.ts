// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { CHANNEL_ID_PATTERN, expect, expectChannel, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("cria o Canal e leva a Pessoa a ele, com o criador no começo", async ({
    loggedInPage: page,
    person,
    createdChannelName: name,
  }) => {
    const dialog = await openCreateChannel(page);
    await dialog.getByLabel("Nome").fill(name);
    await dialog.getByLabel("Descrição").fill("Metas do time");
    const today = await page.evaluate(() =>
      new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(new Date()),
    );

    await dialog.getByRole("button", { name: "Criar canal" }).click();

    await expect(page).toHaveURL(new RegExp(`/canais/${CHANNEL_ID_PATTERN}$`));
    await expectChannel(page, name);
    await expect(dialog).toBeHidden();
    const channels = page.getByRole("region", { name: "Canais" });
    await expect(channels.getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
    const intro = page.getByRole("region", { name: "Começo do canal" });
    await expect(intro.getByText(`@${person.username} criou este canal em ${today}.`)).toBeVisible();
    await expect(intro.getByText("Metas do time")).toBeVisible();
  });
});
