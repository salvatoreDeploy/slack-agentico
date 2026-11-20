import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, logout, sessionCookie } from './support/auth-routes.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase, queryTestDatabase } from './support/test-database.js';

describe('DELETE /v1/sessions/current (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  it('responde 204 e apaga só a Sessão da requisição', async () => {
    const person = await createPerson(app);
    const current = await login(app, person);
    await login(app, person);

    const response = await request(app.getHttpServer())
      .delete('/v1/sessions/current')
      .set('Cookie', sessionCookie(current));

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    const remaining = await queryTestDatabase('SELECT 1 FROM sessions WHERE person_id = $1', [
      person.id,
    ]);
    expect(remaining).toHaveLength(1);
  });

  it('a Sessão apagada passa a responder 401', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    await logout(app, token);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });

  it('outra Sessão da mesma Pessoa continua valendo depois de sair', async () => {
    const person = await createPerson(app);
    const current = await login(app, person);
    const other = await login(app, person);
    await logout(app, current);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(other));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: person.id });
  });

  it('responde 401 sem o cookie', async () => {
    const response = await request(app.getHttpServer()).delete('/v1/sessions/current');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });
});
