import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, sessionCookie } from './support/auth-routes.js';
import { insertChannel } from './support/conversation-rows.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase } from './support/test-database.js';

describe('GET /v1/channels (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  it('lista os Canais da Pessoa em ordem de nome, com o #geral', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    const after = await insertChannel({ prefix: 'zzz', participants: [person.id] });
    const before = await insertChannel({ prefix: 'aaa', participants: [person.id] });
    const hidden = await insertChannel({ prefix: 'mmm' });

    const response = await request(app.getHttpServer())
      .get('/v1/channels')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    const channels = (response.body as { channels: { name: string }[] }).channels;
    const ours = [before.name, 'geral', after.name, hidden.name];
    expect(channels.map((c) => c.name).filter((name) => ours.includes(name))).toEqual([
      before.name,
      'geral',
      after.name,
    ]);
    expect(channels.find((c) => c.name === 'geral')).toEqual({
      id: expect.any(String),
      name: 'geral',
      description: 'Canal de todo o Workspace',
    });
  });

  it('responde 401 sem Sessão', async () => {
    const response = await request(app.getHttpServer()).get('/v1/channels');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'unauthenticated' });
  });
});
