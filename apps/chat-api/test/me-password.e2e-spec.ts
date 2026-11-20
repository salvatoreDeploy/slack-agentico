import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, sessionCookie, type TestPerson } from './support/auth-routes.js';
import { createTestApp } from './support/create-test-app.js';
import {
  blockLogin,
  failLogins,
  findLoginAttempt,
  WRONG_PASSWORD,
} from './support/login-attempts.js';
import { closeTestDatabase } from './support/test-database.js';

const NEW_PASSWORD = 'senha-nova-segura-1';

describe('PUT /v1/me/password (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  function changePassword(token: string | undefined, body: object) {
    const req = request(app.getHttpServer()).put('/v1/me/password');
    if (token) {
      req.set('Cookie', sessionCookie(token));
    }
    return req.send(body);
  }

  function postLogin(person: TestPerson, password: string) {
    return request(app.getHttpServer()).post('/v1/sessions').send({ email: person.email, password });
  }

  function getMe(token: string) {
    return request(app.getHttpServer()).get('/v1/me').set('Cookie', sessionCookie(token));
  }

  it('responde 204, e a senha nova passa a entrar e a antiga não', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);

    const response = await changePassword(token, {
      current_password: person.password,
      new_password: NEW_PASSWORD,
    });

    expect(response.status).toBe(204);
    expect((await postLogin(person, NEW_PASSWORD)).status).toBe(201);
    const old = await postLogin(person, person.password);
    expect(old.status).toBe(401);
    expect(old.body).toMatchObject({ code: 'invalid_credentials' });
  });

  it('encerra as outras Sessões da Pessoa, e a atual continua', async () => {
    const person = await createPerson(app);
    const current = await login(app, person);
    const other = await login(app, person);

    await changePassword(current, {
      current_password: person.password,
      new_password: NEW_PASSWORD,
    }).expect(204);

    const otherMe = await getMe(other);
    expect(otherMe.status).toBe(401);
    expect(otherMe.body).toMatchObject({ code: 'unauthenticated' });
    expect((await getMe(current)).status).toBe(200);
  });

  it('com a senha atual errada, responde 422 e nada muda', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);

    const response = await changePassword(token, {
      current_password: WRONG_PASSWORD,
      new_password: NEW_PASSWORD,
    });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ code: 'wrong_current_password' });
    expect((await postLogin(person, person.password)).status).toBe(201);
  });

  it('com a senha nova igual à atual, responde 422 password_unchanged', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);

    const response = await changePassword(token, {
      current_password: person.password,
      new_password: person.password,
    });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ code: 'password_unchanged' });
  });

  it.each([
    ['a senha nova curta', (p: TestPerson) => ({ current_password: p.password, new_password: 'curta' })],
    ['a senha nova longa', (p: TestPerson) => ({ current_password: p.password, new_password: 'x'.repeat(129) })],
    ['a senha atual vazia', () => ({ current_password: '', new_password: NEW_PASSWORD })],
  ])('com %s, responde 400 validation_failed', async (_case, body) => {
    const person = await createPerson(app);
    const token = await login(app, person);

    const response = await changePassword(token, body(person));

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
  });

  it('responde 401 sem o cookie', async () => {
    const response = await changePassword(undefined, {
      current_password: 'qualquer-senha',
      new_password: NEW_PASSWORD,
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });

  describe('limite de tentativas', () => {
    it('a senha atual errada conta como falha do e-mail da Pessoa', async () => {
      const person = await createPerson(app);
      const token = await login(app, person);

      await changePassword(token, { current_password: WRONG_PASSWORD, new_password: NEW_PASSWORD });

      expect((await findLoginAttempt(person.email))?.failures).toBe(1);
    });

    it('a senha atual certa apaga as falhas do e-mail', async () => {
      const person = await createPerson(app);
      const token = await login(app, person);
      await failLogins(app, person.email, 2);

      const response = await changePassword(token, {
        current_password: person.password,
        new_password: NEW_PASSWORD,
      });

      expect(response.status).toBe(204);
      expect(await findLoginAttempt(person.email)).toBeUndefined();
    });

    it('a senha atual errada que completa as tentativas responde 429 com Retry-After', async () => {
      const person = await createPerson(app);
      const token = await login(app, person);
      await failLogins(app, person.email, 4);

      const response = await changePassword(token, {
        current_password: WRONG_PASSWORD,
        new_password: NEW_PASSWORD,
      });

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({ code: 'too_many_attempts' });
      expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
    });

    it('com o e-mail bloqueado, responde 429 até com a senha atual certa, e a senha não muda', async () => {
      const person = await createPerson(app);
      const token = await login(app, person);
      await blockLogin(person.email, 10 * 60 * 1000);

      const response = await changePassword(token, {
        current_password: person.password,
        new_password: NEW_PASSWORD,
      });

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({ code: 'too_many_attempts' });
      expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
      await blockLogin(person.email, -1000);
      expect((await postLogin(person, person.password)).status).toBe(201);
    });
  });
});
