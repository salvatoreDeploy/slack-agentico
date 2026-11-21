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
    // Como o `create` do comando de contas: a Pessoa nova participa de todos os Canais públicos
    // (spec da F02, "Conversas e participação"). Cópia do `joinPublicChannels` do
    // `ConversationsRepository` da API, que é a fonte da regra; mude os dois juntos.
    await database.query(
      `INSERT INTO participations (conversation_id, person_id)
       SELECT id, $1 FROM conversations WHERE type = 'public_channel'
       ON CONFLICT DO NOTHING`,
      [person.id],
    );
    await provide(person);
    // As tentativas de login não referenciam a Pessoa e saem à parte; apagar a Pessoa leva as
    // Sessões e as participações dela junto (ON DELETE CASCADE).
    await database.query("DELETE FROM login_attempts WHERE email = $1", [person.email]);
    await database.query("DELETE FROM people WHERE id = $1", [person.id]);
  },

  loggedInPage: async ({ page, person }, provide) => {
    await signIn(page, person);
    await expectGeral(page);
    await provide(page);
  },
});

export { expect };

/** O id de um Canal, para conferir endereços. */
export const CHANNEL_ID_PATTERN = "[0-9a-f-]{36}";

/** Confere que a página está no `#geral`, para onde `/` e a entrada sem `voltar` levam. */
export async function expectGeral(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/canais/${CHANNEL_ID_PATTERN}$`));
  await expect(page.getByRole("heading", { level: 1, name: "geral" })).toBeVisible();
}

/** Confere o estado "Conversa não encontrada", dentro da casca (frame de mesmo nome). */
export async function expectNotFound(page: Page): Promise<void> {
  await expect(page.getByRole("complementary", { name: "Conversas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conversa não encontrada" })).toBeVisible();
  await expect(page.getByText("Ela não existe ou você não participa dela.")).toBeVisible();
  await expect(page).toHaveTitle("Conversa não encontrada · Full Cycle Chat");
}

/** O id do `#geral`, que a migração grava (spec da F02, "Conversas e participação"). */
export async function findGeneralChannelId(database: pg.Pool): Promise<string> {
  const result = await database.query<{ id: string }>("SELECT id FROM conversations WHERE name = 'geral'");
  return result.rows[0].id;
}

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

/** As Sessões da Pessoa no banco, para o teste conferir o que a ação apagou. */
export async function findSessions(database: pg.Pool, person: TestPerson): Promise<unknown[]> {
  const result = await database.query("SELECT id FROM sessions WHERE person_id = $1", [person.id]);
  return result.rows;
}

/** Sai pelo menu do usuário: o único lugar da suíte que faz isso. */
export async function signOut(page: Page, person: TestPerson): Promise<void> {
  await page.getByRole("button", { name: `Menu de ${person.name}` }).click();
  await page.getByRole("menuitem", { name: "Sair do Full Cycle" }).click();
}

/** Bloqueia o e-mail pelo limite de tentativas, com a linha gravada direto no banco. */
export async function blockLogin(database: pg.Pool, email: string): Promise<void> {
  await database.query(
    `INSERT INTO login_attempts (email, failures, window_started_at, blocked_until)
     VALUES ($1, 0, now(), now() + interval '15 minutes')`,
    [email],
  );
}

/** A linha de tentativas de login do e-mail, ou `undefined`. */
export async function findLoginAttempt(database: pg.Pool, email: string): Promise<unknown> {
  const result = await database.query("SELECT email FROM login_attempts WHERE email = $1", [email]);
  return result.rows[0];
}

/**
 * Envelhece as Sessões da Pessoa no banco em `byMs`: o `last_used_at` e o `expires_at` recuam
 * juntos, como se o tempo passasse sem uso.
 */
export async function ageSessions(database: pg.Pool, person: TestPerson, byMs: number): Promise<void> {
  await database.query(
    `UPDATE sessions
     SET last_used_at = last_used_at - $2::bigint * interval '1 millisecond',
         expires_at = expires_at - $2::bigint * interval '1 millisecond'
     WHERE person_id = $1`,
    [person.id, byMs],
  );
}

/** Abre o diálogo "Trocar senha" pelo menu do usuário e espera o foco na Senha atual. */
export async function openChangePassword(page: Page, person: TestPerson): Promise<void> {
  await page.getByRole("button", { name: `Menu de ${person.name}` }).click();
  await page.getByRole("menuitem", { name: "Trocar senha" }).click();
  await expect(page.getByLabel("Senha atual")).toBeFocused();
}
