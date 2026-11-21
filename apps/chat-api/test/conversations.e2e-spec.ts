import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, sessionCookie } from './support/auth-routes.js';
import { insertChannel } from './support/conversation-rows.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase } from './support/test-database.js';

interface ChannelBody {
  id: string;
  name: string;
  description: string | null;
}

describe('GET /v1/conversations/:id (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  async function signedIn(): Promise<string> {
    return login(app, await createPerson(app));
  }

  async function findGeral(token: string): Promise<ChannelBody> {
    const response = await request(app.getHttpServer())
      .get('/v1/channels')
      .set('Cookie', sessionCookie(token))
      .expect(200);
    const geral = (response.body as { channels: ChannelBody[] }).channels.find((c) => c.name === 'geral');
    if (!geral) {
      throw new Error('A lista de Canais não trouxe o #geral.');
    }
    return geral;
  }

  it('o #geral existe depois da migração, sem criador e com a descrição', async () => {
    const token = await signedIn();
    const geral = await findGeral(token);

    const response = await request(app.getHttpServer())
      .get(`/v1/conversations/${geral.id}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: geral.id,
      type: 'public_channel',
      name: 'geral',
      description: 'Canal de todo o Workspace',
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      created_by: null,
    });
  });

  it('devolve o Canal com o criador', async () => {
    const person = await createPerson(app, { name: 'Ana Criadora' });
    const token = await login(app, person);
    const channel = await insertChannel({ createdBy: person.id, participants: [person.id] });

    const response = await request(app.getHttpServer())
      .get(`/v1/conversations/${channel.id}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: channel.id,
      type: 'public_channel',
      name: channel.name,
      description: 'Canal de teste',
      created_by: { id: person.id, name: 'Ana Criadora', username: person.username },
    });
  });

  it.each([
    ['id malformado', () => Promise.resolve('nao-e-um-uuid')],
    ['Conversa inexistente', () => Promise.resolve(randomUUID())],
    ['Canal sem participação', async () => (await insertChannel()).id],
  ])('%s responde o mesmo 404', async (_case, conversationId) => {
    const token = await signedIn();
    const id = await conversationId();

    const response = await request(app.getHttpServer())
      .get(`/v1/conversations/${id}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      code: 'not_found',
      detail: 'A conversa não existe ou você não participa dela.',
    });
  });
});
