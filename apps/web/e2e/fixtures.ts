import { randomUUID } from "node:crypto";
import { test as base, expect, type Locator, type Page, type Route } from "@playwright/test";
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

export interface TestChannel {
  id: string;
  name: string;
}

interface Fixtures {
  /** Uma Pessoa gravada direto no banco `chat`, apagada ao fim do teste. */
  person: TestPerson;
  /** Uma segunda Pessoa, autora das Mensagens "de outra Pessoa", apagada ao fim do teste. */
  otherPerson: TestPerson;
  /**
   * Um Canal público com nome único e a participação das Pessoas que já existem, inclusive a da
   * fixture `person`. Os testes de Mensagem escrevem só nele, nunca no `#geral`, porque a suíte roda
   * em paralelo no banco `chat`. Apagá-lo ao fim leva as Mensagens e as participações.
   */
  testChannel: TestChannel;
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
    const person = await insertPerson(database, "Ana Teste");
    await provide(person);
    await deletePerson(database, person);
  },

  otherPerson: async ({ database }, provide) => {
    const person = await insertPerson(database, "Bruno Outro");
    await provide(person);
    await deletePerson(database, person);
  },

  testChannel: async ({ database, person }, provide) => {
    const id = randomUUID();
    const channel: TestChannel = { id, name: `e2e-${id.slice(-12)}` };
    await database.query(
      `INSERT INTO conversations (id, type, name, description)
       VALUES ($1, 'public_channel', $2, 'Canal de teste')`,
      [channel.id, channel.name],
    );
    // Todas as Pessoas, como na criação de Canal (spec da F02), menos as de outros testes, que
    // podem estar sendo apagadas em paralelo, e mais a Pessoa deste teste.
    await database.query(
      `INSERT INTO participations (conversation_id, person_id)
       SELECT $1, id FROM people WHERE email NOT LIKE 'e2e-%@teste.local' OR id = $2`,
      [channel.id, person.id],
    );
    await provide(channel);
    await database.query("DELETE FROM conversations WHERE id = $1", [channel.id]);
  },

  loggedInPage: async ({ page, person }, provide) => {
    await signIn(page, person);
    await expectGeral(page);
    await provide(page);
  },
});

export { expect };

/**
 * Grava uma Pessoa direto no banco, com e-mail único e a senha de teste, e a participação dela em
 * todos os Canais públicos, como o `create` do comando de contas (spec da F02, "Conversas e
 * participação"). O `INSERT … SELECT` segue o `joinPublicChannels` do `ConversationsRepository`
 * da API, que é a fonte da regra, menos os Canais de outros testes, que podem estar sendo apagados
 * em paralelo e quebrariam a chave estrangeira.
 */
async function insertPerson(database: pg.Pool, name: string): Promise<TestPerson> {
  const id = randomUUID();
  const tag = id.replace(/-/g, "").slice(0, 12);
  const person: TestPerson = {
    id,
    name,
    username: `e2e${tag}`,
    email: `e2e-${tag}@teste.local`,
    password: TEST_PASSWORD,
  };
  await database.query(
    "INSERT INTO people (id, name, username, email, password_hash) VALUES ($1, $2, $3, $4, $5)",
    [person.id, person.name, person.username, person.email, TEST_PASSWORD_HASH],
  );
  await database.query(
    `INSERT INTO participations (conversation_id, person_id)
     SELECT id, $1 FROM conversations WHERE type = 'public_channel' AND name NOT LIKE 'e2e-%'
     ON CONFLICT DO NOTHING`,
    [person.id],
  );
  return person;
}

/**
 * Apaga a Pessoa. As tentativas de login não a referenciam e saem à parte; as Sessões, as
 * participações e as Mensagens dela saem junto (ON DELETE CASCADE).
 */
async function deletePerson(database: pg.Pool, person: TestPerson): Promise<void> {
  await database.query("DELETE FROM login_attempts WHERE email = $1", [person.email]);
  await database.query("DELETE FROM people WHERE id = $1", [person.id]);
}

/**
 * Grava uma Mensagem direto no banco, com a data opcional, para montar um histórico (como o de
 * dois dias) ou a Mensagem de outra Pessoa que só aparece ao reabrir o Canal.
 */
export async function insertMessage(
  database: pg.Pool,
  message: { channelId: string; authorId: string; body: string; createdAt?: Date },
): Promise<void> {
  await database.query(
    `INSERT INTO messages (id, conversation_id, author_person_id, client_message_id, body, created_at)
     VALUES (uuidv7($4::timestamptz - now()), $1, $2, gen_random_uuid(), $3, $4)`,
    [message.channelId, message.authorId, message.body, message.createdAt ?? new Date()],
  );
}

/** Abre um Canal pelo endereço e espera ele ficar pronto. */
export async function openChannel(page: Page, channel: TestChannel): Promise<void> {
  await page.goto(`/canais/${channel.id}`);
  await expectChannel(page, channel.name);
}

/** Um dia, para montar o histórico de ontem e de hoje. */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** O composer do Canal. */
export function composerOf(page: Page, channel: TestChannel): Locator {
  return page.getByRole("textbox", { name: `Mensagem para #${channel.name}` });
}

/** A lista do histórico do Canal. */
export function historyOf(page: Page, channel: TestChannel): Locator {
  return page.getByRole("list", { name: `Mensagens de #${channel.name}` });
}

/**
 * Intercepta as chamadas de Server Action do Canal, que vão por `POST` ao endereço da página com
 * o cabeçalho `next-action`, como o envio de Mensagem. `handle` decide o destino de cada uma; o
 * resto segue normal.
 */
export async function routeSend(
  page: Page,
  channel: TestChannel,
  handle: (route: Route) => Promise<void>,
): Promise<void> {
  await page.route(`**/canais/${channel.id}`, async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.headers()["next-action"]) {
      await handle(route);
    } else {
      await route.continue();
    }
  });
}

/**
 * Faz o envio de Mensagem falhar até `release()`. Com `afterReaching`, o envio chega à API e grava,
 * mas a resposta se perde no caminho, como numa queda de rede logo depois do envio.
 */
export async function failSends(
  page: Page,
  channel: TestChannel,
  options: { afterReaching?: boolean } = {},
): Promise<{ release: () => void }> {
  let isFailing = true;
  await routeSend(page, channel, async (route) => {
    if (!isFailing) {
      await route.continue();
      return;
    }
    if (options.afterReaching) {
      await route.fetch();
    }
    await route.abort();
  });
  return { release: () => (isFailing = false) };
}

/** Envia o texto pelo composer e devolve a Mensagem na lista do histórico. */
export async function sendFromComposer(page: Page, channel: TestChannel, text: string): Promise<Locator> {
  const composer = composerOf(page, channel);
  await composer.fill(text);
  await composer.press("Enter");
  return historyOf(page, channel).getByRole("listitem").filter({ hasText: text });
}

/** O aviso de Mensagem não enviada, dentro da Mensagem. */
export function failureOf(item: Locator): Locator {
  return item.getByText("Não foi possível enviar.");
}

/** O botão "Tentar de novo", dentro da Mensagem não enviada. */
export function retryOf(item: Locator): Locator {
  return item.getByRole("button", { name: "Tentar de novo" });
}

/**
 * Aperta `key` até o foco chegar ao elemento, no máximo `max` vezes, para os testes que provam o
 * caminho do teclado sem depender da ordem exata dos elementos da casca.
 */
export async function tabUntilFocused(
  page: Page,
  target: Locator,
  { key = "Tab", max = 15 }: { key?: "Tab" | "Shift+Tab"; max?: number } = {},
): Promise<void> {
  for (let i = 0; i < max && !(await target.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}

/** O texto de uma Mensagem da lista, com as quebras de linha, como a Pessoa o vê. */
export function messageText(item: Locator): Promise<string> {
  return item.locator("p").nth(1).innerText();
}

/** O id de um Canal, para conferir endereços. */
export const CHANNEL_ID_PATTERN = "[0-9a-f-]{36}";

/**
 * Confere que a página está no Canal pronto: o cabeçalho e o título, que chega por streaming depois
 * do conteúdo; o axe e as outras conferências esperam por ele.
 */
export async function expectChannel(page: Page, name: string): Promise<void> {
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page).toHaveTitle(`#${name} · Full Cycle Chat`);
}

/** Confere que a página está no `#geral`, para onde `/` e a entrada sem `voltar` levam. */
export async function expectGeral(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`/canais/${CHANNEL_ID_PATTERN}$`));
  await expectChannel(page, "geral");
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
