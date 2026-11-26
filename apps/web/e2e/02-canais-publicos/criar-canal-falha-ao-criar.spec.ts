// spec: e2e/plans/02-canais-publicos.plan.md
// seed: e2e/seed.spec.ts
import { expect, failCreateChannel, openCreateChannel, test } from "../fixtures";

test.describe("Criar canal", () => {
  test("a falha no envio aparece no corpo do diálogo, com os campos preenchidos", async ({
    loggedInPage: page,
    createdChannelName: channelName,
  }) => {
    await failCreateChannel(page);
    const dialog = await openCreateChannel(page);
    await dialog.getByLabel("Nome").fill(channelName);
    await dialog.getByLabel("Descrição").fill("Metas do time");

    await dialog.getByRole("button", { name: "Criar canal" }).click();

    await expect(dialog.getByRole("alert")).toHaveText("Não foi possível criar o canal. Tente de novo.");
    await expect(dialog.getByLabel("Nome")).toHaveValue(channelName);
    await expect(dialog.getByLabel("Descrição")).toHaveValue("Metas do time");
  });
});
