import { randomUUID } from 'node:crypto';
import { closeTestDatabase, queryTestDatabase } from '../../test/support/test-database.js';
import { uniqueEmail } from '../../test/support/unique-email.js';
import { runAccountsCommand } from './accounts-command.js';

const PASSWORD = 'senha-segura-1';

interface PersonRow {
  name: string;
  username: string;
  email: string;
  password_hash: string;
}

/** Entrada e saída do comando no teste: as senhas digitadas vêm da lista, e a saída fica gravada. */
function fakeTerminal(passwords: string[]) {
  const typed = [...passwords];
  const lines: string[] = [];
  return {
    lines,
    io: {
      readPassword: () => Promise.resolve(typed.shift() ?? ''),
      log: (message: string) => lines.push(message),
      error: (message: string) => lines.push(message),
    },
  };
}

async function findPerson(email: string): Promise<PersonRow | undefined> {
  const rows = await queryTestDatabase<PersonRow>(
    'SELECT name, username, email, password_hash FROM people WHERE email = $1',
    [email],
  );
  return rows[0];
}

/** Um e-mail único cuja parte local é a dada, para provar a derivação do @usuário. */
function emailWithLocalPart(localPart: string): string {
  return `${localPart}@${uniqueEmail('dominio').split('@')[0]}.teste.local`;
}

describe('comando de contas: create', () => {
  afterAll(async () => {
    await closeTestDatabase();
  });

  it('cria a Pessoa com o e-mail normalizado e o hash da senha', async () => {
    const email = uniqueEmail();
    const terminal = fakeTerminal([PASSWORD, PASSWORD]);

    const exitCode = await runAccountsCommand(
      ['create', `  ${email.toUpperCase()} `, 'Ana Souza', '--username', `ana${Date.now()}`],
      terminal.io,
    );

    expect(exitCode).toBe(0);
    const person = await findPerson(email);
    expect(person).toMatchObject({ name: 'Ana Souza', email });
    expect(person?.password_hash).toMatch(/^\$argon2id\$/);
    expect(terminal.lines.join('\n')).not.toContain(PASSWORD);
    expect(terminal.lines.join('\n')).not.toContain(person?.password_hash);
  });

  describe('sem --username, deriva o @usuário do e-mail', () => {
    const cases: Array<[string, (tag: string) => string, (tag: string) => string]> = [
      ['tira os acentos', (tag) => `joão${tag}`, (tag) => `joao${tag}`],
      ['troca por - o que está fora do conjunto', (tag) => `ana+${tag}`, (tag) => `ana-${tag}`],
      ['põe o prefixo p quando não começa por letra', (tag) => `9${tag}`, (tag) => `p9${tag}`],
      ['corta no máximo de 30', (tag) => `${tag}${'a'.repeat(30)}`, (tag) => `${tag}${'a'.repeat(30)}`.slice(0, 30)],
    ];

    it.each(cases)('%s', async (_, localPart, expected) => {
      const tag = uniqueTag();
      const email = emailWithLocalPart(localPart(tag));

      const exitCode = await runAccountsCommand(
        ['create', email, 'Pessoa'],
        fakeTerminal([PASSWORD, PASSWORD]).io,
      );

      expect(exitCode).toBe(0);
      expect((await findPerson(email))?.username).toBe(expected(tag));
    });

    it('completa com - até o mínimo de 3', async () => {
      const email = emailWithLocalPart('ab');

      await runAccountsCommand(['create', email, 'Pessoa'], fakeTerminal([PASSWORD, PASSWORD]).io);

      expect((await findPerson(email))?.username).toBe('ab-');
    });

    it('ganha o primeiro sufixo numérico livre quando o @usuário já existe', async () => {
      const tag = uniqueTag();
      const first = emailWithLocalPart(tag);
      const second = emailWithLocalPart(tag);
      await runAccountsCommand(['create', first, 'Primeira'], fakeTerminal([PASSWORD, PASSWORD]).io);

      await runAccountsCommand(['create', second, 'Segunda'], fakeTerminal([PASSWORD, PASSWORD]).io);

      expect((await findPerson(second))?.username).toBe(`${tag}2`);
    });
  });

  describe('recusa sem criar nada', () => {
    it('um e-mail já usado', async () => {
      const email = uniqueEmail();
      await runAccountsCommand(['create', email, 'Primeira'], fakeTerminal([PASSWORD, PASSWORD]).io);
      const terminal = fakeTerminal([PASSWORD, PASSWORD]);

      const exitCode = await runAccountsCommand(['create', email, 'Segunda'], terminal.io);

      expect(exitCode).not.toBe(0);
      expect(terminal.lines.join('\n')).toContain('Já existe uma conta com este e-mail.');
      expect((await findPerson(email))?.name).toBe('Primeira');
    });

    const refusals: Array<[string, (email: string) => string[], string[], RegExp]> = [
      ['um @usuário já usado', (email) => ['create', email, 'Pessoa', '--username', TAKEN_USERNAME], [PASSWORD, PASSWORD], /@usuário já está em uso/],
      ['um @usuário inválido', (email) => ['create', email, 'Pessoa', '--username', 'Ana'], [PASSWORD, PASSWORD], /@usuário tem de 3 a 30/],
      ['um nome vazio', (email) => ['create', email, '   '], [PASSWORD, PASSWORD], /nome tem de 1 a 80/],
      ['uma senha curta', (email) => ['create', email, 'Pessoa'], ['curta', 'curta'], /senha tem de 8 a 128/],
      ['duas senhas diferentes', (email) => ['create', email, 'Pessoa'], [PASSWORD, 'outra-senha-1'], /senhas digitadas são diferentes/],
    ];

    it.each(refusals)('%s', async (_, args, passwords, message) => {
      const email = uniqueEmail();
      const terminal = fakeTerminal(passwords);

      const exitCode = await runAccountsCommand(args(email), terminal.io);

      expect(exitCode).not.toBe(0);
      expect(terminal.lines.join('\n')).toMatch(message);
      expect(await findPerson(email)).toBeUndefined();
    });
  });
});

const TAKEN_USERNAME = `usado${Date.now()}`;

beforeAll(async () => {
  await runAccountsCommand(
    ['create', uniqueEmail(), 'Dona do @usuário', '--username', TAKEN_USERNAME],
    fakeTerminal([PASSWORD, PASSWORD]).io,
  );
});

/** Um trecho único que começa por letra, para cada caso de derivação ter o próprio @usuário. */
function uniqueTag(): string {
  return `x${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}
