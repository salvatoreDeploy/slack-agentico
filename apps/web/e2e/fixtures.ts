import { randomUUID } from "node:crypto";
import { test as base, expect, type Page } from "@playwright/test";
import pg from "pg";

/** Senha de teste das Pessoas criadas pela fixture `person`. */
export const TEST_PASSWORD = "senha-de-teste-1";

/**
 * Hash Argon2id de `TEST_PASSWORD`, calculado uma vez pelo `@node-rs/argon2` da API do chat com
 * os parâmetros do LLD ("Segurança"), para a web não depender de Argon2.
 */
const TEST_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$hQPoZFyV2epPncHp5a2IbA$AKvLN10WQlTZ0p/2QRQUY781csHB+TtTZ8plE9TrvLU";

export interface TestPerson {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
}

interface Fixtures {
  /** Uma Pessoa gravada direto no banco `chat`, apagada ao fim do teste. */
  person: TestPerson;
  /** Uma página que já entrou pelo formulário da tela Entrar, com a Pessoa da fixture. */
  loggedInPage: Page;
}

interface WorkerFixtures {
  database: pg.Pool;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  database: [
    async ({}, provide) => {
      const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
      await provide(pool);
      await pool.end();
    },
    { scope: "worker" },
  ],

  person: async ({ database }, provide) => {
    const id = randomUUID();
    const tag = id.replace(/-/g, "").slice(0, 12);
    const person: TestPerson = {
      id,
      name: "Ana Teste",
      username: `e2e${tag}`,
      email: `e2e-${tag}@teste.local`,
      password: TEST_PASSWORD,
    };
    await database.query(
      "INSERT INTO people (id, name, username, email, password_hash) VALUES ($1, $2, $3, $4, $5)",
      [person.id, person.name, person.username, person.email, TEST_PASSWORD_HASH],
    );
    await provide(person);
    // Apagar a Pessoa leva as Sessões dela junto (ON DELETE CASCADE).
    await database.query("DELETE FROM people WHERE id = $1", [person.id]);
  },

  loggedInPage: async ({ page, person }, provide) => {
    await signIn(page, person);
    await expect(page).toHaveURL("/");
    await provide(page);
  },
});

export { expect };

/** Entra pelo formulário da tela Entrar: o único lugar da suíte que faz isso. */
export async function signIn(page: Page, person: TestPerson): Promise<void> {
  if (!page.url().includes("/entrar")) {
    await page.goto("/entrar");
  }
  await page.getByLabel("E-mail").fill(person.email);
  await page.getByLabel("Senha").fill(person.password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** Apaga as Sessões da Pessoa no banco, para o teste de Sessão inválida. */
export async function deleteSessions(database: pg.Pool, person: TestPerson): Promise<void> {
  await database.query("DELETE FROM sessions WHERE person_id = $1", [person.id]);
}
