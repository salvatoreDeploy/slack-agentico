import { createHash } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson } from './support/auth-routes.js';
import { createTestApp } from './support/create-test-app.js';
import {
  ageLoginWindow,
  blockLogin,
  failLogins,
  findLoginAttempt,
  WRONG_PASSWORD,
} from './support/login-attempts.js';
import { closeTestDatabase, queryTestDatabase } from './support/test-database.js';
import { uniqueEmail } from './support/unique-email.js';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const BLOCK_SECONDS = 15 * 60;

describe('Limite de tentativas de login (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  function postLogin(email: string, password: string) {
    return request(app.getHttpServer()).post('/v1/sessions').send({ email, password });
  }

  it('guarda uma linha por e-mail normalizado, somando as falhas', async () => {
    const person = await createPerson(app);
    await failLogins(app, person.email, 1);

    const response = await postLogin(`  ${person.email.toUpperCase()} `, WRONG_PASSWORD);

    expect(response.status).toBe(401);
    const rows = await queryTestDatabase<{ email: string; failures: number }>(
      'SELECT email, failures FROM login_attempts WHERE lower(email) = $1',
      [person.email],
    );
    expect(rows).toEqual([{ email: person.email, failures: 2 }]);
  });

  it('bloqueia na falha que completa as tentativas, com 429 e Retry-After', async () => {
    const person = await createPerson(app);
    await failLogins(app, person.email, 4);

    const response = await postLogin(person.email, WRONG_PASSWORD);

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({ code: 'too_many_attempts' });
    expect(Number(response.headers['retry-after'])).toBeGreaterThanOrEqual(BLOCK_SECONDS - 1);
    expect(Number(response.headers['retry-after'])).toBeLessThanOrEqual(BLOCK_SECONDS);
    const row = await findLoginAttempt(person.email);
    expect(row?.failures).toBe(0);
    const remainingMs = (row?.blocked_until?.getTime() ?? 0) - Date.now();
    expect(remainingMs).toBeGreaterThan(FIFTEEN_MINUTES_MS - 5_000);
    expect(remainingMs).toBeLessThanOrEqual(FIFTEEN_MINUTES_MS);
  });

  it('recomeça a contagem quando a janela das falhas já passou', async () => {
    const person = await createPerson(app);
    await failLogins(app, person.email, 4);
    await ageLoginWindow(person.email, FIFTEEN_MINUTES_MS + 60_000);

    const response = await postLogin(person.email, WRONG_PASSWORD);

    expect(response.status).toBe(401);
    expect((await findLoginAttempt(person.email))?.failures).toBe(1);
  });

  it('durante o bloqueio, responde 429 até para a senha certa, sem criar Sessão', async () => {
    const person = await createPerson(app);
    await blockLogin(person.email, 10 * 60 * 1000);

    const response = await postLogin(person.email, person.password);

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({ code: 'too_many_attempts' });
    const retryAfter = Number(response.headers['retry-after']);
    expect(retryAfter).toBeGreaterThanOrEqual(10 * 60 - 1);
    expect(retryAfter).toBeLessThanOrEqual(10 * 60);
    const sessions = await queryTestDatabase('SELECT 1 FROM sessions WHERE person_id = $1', [
      person.id,
    ]);
    expect(sessions).toHaveLength(0);
  });

  it('as tentativas durante o bloqueio não o estendem', async () => {
    const person = await createPerson(app);
    await blockLogin(person.email, 10 * 60 * 1000);
    const before = await findLoginAttempt(person.email);

    const response = await postLogin(person.email, WRONG_PASSWORD);

    expect(response.status).toBe(429);
    expect(await findLoginAttempt(person.email)).toEqual(before);
  });

  it('passado o bloqueio, a senha certa entra', async () => {
    const person = await createPerson(app);
    await blockLogin(person.email, -1000);

    const response = await postLogin(person.email, person.password);

    expect(response.status).toBe(201);
  });

  it('um login certo antes do limite zera a contagem', async () => {
    const person = await createPerson(app);
    await failLogins(app, person.email, 4);

    const response = await postLogin(person.email, person.password);

    expect(response.status).toBe(201);
    expect(await findLoginAttempt(person.email)).toBeUndefined();
  });

  it('o limite vale também para e-mail sem conta, com o mesmo corpo', async () => {
    const email = uniqueEmail();
    const person = await createPerson(app);
    await failLogins(app, email, 4);
    await failLogins(app, person.email, 4);
    const withAccount = await postLogin(person.email, WRONG_PASSWORD);

    const withoutAccount = await postLogin(email, WRONG_PASSWORD);

    expect(withoutAccount.status).toBe(429);
    expect(withoutAccount.body).toEqual(withAccount.body);
  });

  it('duas falhas simultâneas contam as duas', async () => {
    const person = await createPerson(app);

    await Promise.all([
      postLogin(person.email, WRONG_PASSWORD),
      postLogin(person.email, WRONG_PASSWORD),
    ]);

    expect((await findLoginAttempt(person.email))?.failures).toBe(2);
  });

  it.each([
    ['senha vazia', (email: string) => ({ email, password: '' })],
    ['e-mail em formato inválido', () => ({ email: 'nao-e-email', password: WRONG_PASSWORD })],
  ])('com %s, responde 400 e não conta como falha', async (_case, body) => {
    const email = uniqueEmail();

    const response = await request(app.getHttpServer()).post('/v1/sessions').send(body(email));

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
    expect(await findLoginAttempt(email)).toBeUndefined();
    expect(await findLoginAttempt('nao-e-email')).toBeUndefined();
  });

  it('registra o bloqueio em warn com o hash do e-mail', async () => {
    const person = await createPerson(app);
    await failLogins(app, person.email, 4);
    const warn = vi.spyOn(PinoLogger.prototype, 'warn');

    await postLogin(person.email, WRONG_PASSWORD).expect(429);

    const emailHash = createHash('sha256').update(person.email).digest('hex');
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ email_hash: emailHash }),
      expect.any(String),
      expect.anything(),
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain(person.email);
  });
});
