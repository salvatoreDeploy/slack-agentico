// spec: e2e/plans/01-entrar-e-sair.plan.md
// seed: e2e/seed.spec.ts
import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";

async function openByKeyboard(page: Page, menuName: string) {
  await page.getByRole("button", { name: menuName }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  // Home leva ao primeiro item, abra o menu com ou sem o foco já num item.
  await page.keyboard.press("Home");
  await expect(page.getByRole("menuitem", { name: "Trocar senha" })).toBeFocused();
  await page.keyboard.press("Enter");
}

test.describe("Trocar senha", () => {
  test("o diálogo funciona só pelo teclado, com o foco preso nele e de volta ao avatar", async ({
    loggedInPage: page,
    person,
  }) => {
    const menuName = `Menu de ${person.name}`;
    const dialog = page.getByRole("dialog");
    await openByKeyboard(page, menuName);
    await expect(page.getByLabel("Senha atual")).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: menuName })).toBeFocused();

    await openByKeyboard(page, menuName);
    await page.keyboard.type(person.password);
    await page.keyboard.press("Tab");
    await page.keyboard.type("senha-nova-segura-1");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Salvar" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByText("Senha trocada. Você saiu dos outros navegadores.")).toBeVisible();
  });
});
