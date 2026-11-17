import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, expireSessions, login, sessionCookie } from './support/auth-routes.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase, queryTestDatabase } from './support/test-database.js';

describe('GET /v1/me (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  it('responde 200 com a Pessoa da Sessão', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: person.id,
      name: person.name,
      username: person.username,
      email: person.email,
    });
  });

  it('responde 401 sem o cookie', async () => {
    const response = await request(app.getHttpServer()).get('/v1/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });

  it('responde 401 com um token desconhecido', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie('token-que-ninguem-recebeu'));

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });

  it('responde 401 e apaga a Sessão vencida', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    await expireSessions(person);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
    const remaining = await queryTestDatabase('SELECT 1 FROM sessions WHERE person_id = $1', [
      person.id,
    ]);
    expect(remaining).toHaveLength(0);
  });
});
