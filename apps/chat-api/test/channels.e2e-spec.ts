import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, sessionCookie } from './support/auth-routes.js';
import { deleteChannel, insertChannel } from './support/conversation-rows.js';
import { createTestApp } from './support/create-test-app.js';
import { closeTestDatabase, queryTestDatabase } from './support/test-database.js';

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

interface ChannelBody {
  id: string;
  name: string;
  description: string | null;
}

describe('POST /v1/channels (e2e)', () => {
  let app: INestApplication<App>;
  const created: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    for (const id of created.splice(0)) {
      await deleteChannel(id);
    }
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  /** Um sufixo para o nome de cada teste não colidir com o de outro. */
  function suffix(): string {
    return randomUUID().slice(-12);
  }

  /** `POST /v1/channels`; o Canal criado é apagado no fim do teste. */
  async function create(token: string, body: object) {
    const response = await request(app.getHttpServer())
      .post('/v1/channels')
      .set('Cookie', sessionCookie(token))
      .send(body);
    if (response.status === 201) {
      created.push((response.body as ChannelBody).id);
    }
    return response;
  }

  /** Cria o Canal no Arrange, falhando sozinho se não for criado. */
  async function createChannel(token: string, name: string): Promise<ChannelBody> {
    const response = await create(token, { name });
    if (response.status !== 201) {
      throw new Error(`O Canal do Arrange não foi criado: ${response.status}`);
    }
    return response.body as ChannelBody;
  }

  it('cria o Canal com o nome normalizado e a descrição tratada', async () => {
    const person = await createPerson(app);
    const token = await login(app, person);
    const id = suffix();

    const response = await create(token, { name: `Café & Vendas ${id}!`, description: '  Metas\ndo time  ' });

    expect(response.status).toBe(201);
    const channel = response.body as ChannelBody;
    expect(channel).toEqual({ id: expect.any(String), name: `cafe-vendas-${id}`, description: 'Metas do time' });
    const conversation = await request(app.getHttpServer())
      .get(`/v1/conversations/${channel.id}`)
      .set('Cookie', sessionCookie(token));
    expect(conversation.body).toMatchObject({
      type: 'public_channel',
      created_by: { id: person.id, name: person.name, username: person.username },
    });
  });

  it('o Canal novo aparece na lista de outra Pessoa', async () => {
    const other = await createPerson(app);
    const otherToken = await login(app, other);
    const token = await login(app, await createPerson(app));
    const channel = await createChannel(token, `novo-${suffix()}`);

    const response = await request(app.getHttpServer()).get('/v1/channels').set('Cookie', sessionCookie(otherToken));

    expect((response.body as { channels: ChannelBody[] }).channels).toContainEqual(channel);
  });

  it.each([[{}], [{ description: '' }], [{ description: ' \n ' }], [{ description: null }]])(
    'a descrição ausente ou vazia (%j) fica nula',
    async (extra) => {
      const token = await login(app, await createPerson(app));

      const response = await create(token, { name: `sem-descricao-${suffix()}`, ...extra });

      expect(response.status).toBe(201);
      expect((response.body as ChannelBody).description).toBeNull();
    },
  );

  it.each([['!!!'], ['a'.repeat(81)], [42]])('um nome vazio depois da normalização ou longo demais (%j) responde 400', async (name) => {
    const token = await login(app, await createPerson(app));

    const response = await create(token, { name });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed', errors: [{ field: 'name' }] });
  });

  it('80 caracteres no nome passam', async () => {
    const token = await login(app, await createPerson(app));
    const name = `${suffix()}${'a'.repeat(68)}`;

    const response = await create(token, { name });

    expect(response.status).toBe(201);
    expect((response.body as ChannelBody).name).toBe(name);
  });

  it('uma descrição com 250 caracteres passa', async () => {
    const token = await login(app, await createPerson(app));

    const response = await create(token, { name: `descricao-${suffix()}`, description: 'é'.repeat(250) });

    expect(response.status).toBe(201);
  });

  it('uma descrição longa demais responde 400', async () => {
    const token = await login(app, await createPerson(app));

    const response = await create(token, { name: `descricao-${suffix()}`, description: 'é'.repeat(251) });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed', errors: [{ field: 'description' }] });
  });

  it('o nome do #geral responde 409 sem gravar nada', async () => {
    const token = await login(app, await createPerson(app));
    const before = await request(app.getHttpServer()).get('/v1/channels').set('Cookie', sessionCookie(token));

    const response = await create(token, { name: 'GERAL', description: 'outra' });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'channel_name_taken', detail: 'Já existe um Canal com esse nome.' });
    const after = await request(app.getHttpServer()).get('/v1/channels').set('Cookie', sessionCookie(token));
    expect(after.body).toEqual(before.body);
  });

  it('o nome de um Canal criado antes responde 409 sem gravar nada', async () => {
    const token = await login(app, await createPerson(app));
    const existing = await createChannel(token, `Usado ${suffix()}`);
    const before = await request(app.getHttpServer()).get('/v1/channels').set('Cookie', sessionCookie(token));

    const response = await create(token, { name: existing.name.toUpperCase(), description: 'outra' });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ code: 'channel_name_taken' });
    const after = await request(app.getHttpServer()).get('/v1/channels').set('Cookie', sessionCookie(token));
    expect(after.body).toEqual(before.body);
  });

  it('duas criações simultâneas com o mesmo nome criam um Canal só', async () => {
    const token = await login(app, await createPerson(app));
    const name = `simultaneo-${suffix()}`;

    const responses = await Promise.all([create(token, { name }), create(token, { name })]);

    expect(responses.map((r) => r.status).toSorted((a, b) => a - b)).toEqual([201, 409]);
    const rows = await queryTestDatabase('SELECT id FROM conversations WHERE name = $1', [name]);
    expect(rows).toHaveLength(1);
  });

  it('responde 401 sem Sessão', async () => {
    const response = await request(app.getHttpServer()).post('/v1/channels').send({ name: 'sem-sessao' });

    expect(response.status).toBe(401);
  });
});
