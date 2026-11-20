import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { ageSessions, createPerson, login, sessionCookie } from './support/auth-routes.js';
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

  it('renova a validade quando passou o intervalo de renovação', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    await ageSessions(person, 25 * HOUR_MS);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    const [session] = await findSessions(person.id);
    expect(Date.now() - session.last_used_at.getTime()).toBeLessThan(5_000);
    expect(session.expires_at.getTime() - session.last_used_at.getTime()).toBe(THIRTY_DAYS_MS);
  });

  it('não renova antes do intervalo de renovação', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    await ageSessions(person, 23 * HOUR_MS);
    const [before] = await findSessions(person.id);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    expect(await findSessions(person.id)).toEqual([before]);
  });

  it('responde 401 e apaga a Sessão sem uso pela duração da sessão', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    await ageSessions(person, THIRTY_DAYS_MS + 60_000);

    const response = await request(app.getHttpServer())
      .get('/v1/me')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
    expect(await findSessions(person.id)).toHaveLength(0);
  });
});

const HOUR_MS = 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * HOUR_MS;

interface SessionRow {
  last_used_at: Date;
  expires_at: Date;
}

function findSessions(personId: string): Promise<SessionRow[]> {
  return queryTestDatabase<SessionRow>(
    'SELECT last_used_at, expires_at FROM sessions WHERE person_id = $1',
    [personId],
  );
}
