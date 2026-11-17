import { createHash } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson } from './support/auth-routes.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase, queryTestDatabase } from './support/test-database.js';
import { uniqueEmail } from './support/unique-email.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface SessionRow {
  token_hash: Buffer;
  created_at: Date;
  expires_at: Date;
}

describe('POST /v1/sessions (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  it('responde 201 com o token e a Pessoa, aceitando o e-mail em maiúsculas e com espaços', async () => {
    const person = await createPerson(app);

    const response = await request(app.getHttpServer())
      .post('/v1/sessions')
      .send({ email: `  ${person.email.toUpperCase()} `, password: person.password });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      token: expect.any(String),
      person: { id: person.id, name: person.name, username: person.username, email: person.email },
    });
  });

  it('grava a Sessão com o hash do token, e não o token, vencendo em 30 dias', async () => {
    const person = await createPerson(app);

    const response = await request(app.getHttpServer())
      .post('/v1/sessions')
      .send({ email: person.email, password: person.password });

    const token = (response.body as { token: string }).token;
    const [session] = await queryTestDatabase<SessionRow>(
      'SELECT token_hash, created_at, expires_at FROM sessions WHERE person_id = $1',
      [person.id],
    );
    expect(session.token_hash.equals(createHash('sha256').update(token).digest())).toBe(true);
    expect(session.token_hash.toString('utf8')).not.toContain(token);
    expect(session.expires_at.getTime() - session.created_at.getTime()).toBeCloseTo(
      THIRTY_DAYS_MS,
      -4,
    );
  });

  it('responde 401 com o mesmo corpo para e-mail inexistente e para senha errada', async () => {
    const person = await createPerson(app);
    const server = app.getHttpServer();

    const unknownEmail = await request(server)
      .post('/v1/sessions')
      .send({ email: uniqueEmail(), password: person.password });
    const wrongPassword = await request(server)
      .post('/v1/sessions')
      .send({ email: person.email, password: 'senha-errada-1' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toMatchObject({ code: 'invalid_credentials' });
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it.each([
    ['um e-mail em formato inválido', { email: 'nao-e-email', password: 'qualquer-1' }],
    ['um e-mail acima de 254 caracteres', { email: `${'a'.repeat(250)}@x.io`, password: 'qualquer-1' }],
    ['uma senha vazia', { email: 'alguem@teste.local', password: '' }],
    ['uma senha acima de 128 caracteres', { email: 'alguem@teste.local', password: 'a'.repeat(129) }],
  ])('responde 400 com validation_failed para %s', async (_, body) => {
    const response = await request(app.getHttpServer()).post('/v1/sessions').send(body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
  });
});
