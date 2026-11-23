import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createPerson, login, sessionCookie, TestPerson } from './support/auth-routes.js';
import { insertChannel } from './support/conversation-rows.js';
import { createTestApp } from './support/create-test-app.js';
import { insertMessages, renamePerson } from './support/message-rows.js';
import { closeTestDatabase } from './support/test-database.js';

interface MessageBody {
  id: string;
  conversation_id: string;
  client_message_id: string;
  author: { id: string; name: string; username: string };
  body: string;
  created_at: string;
}

/** A resposta de `GET /v1/conversations/:id/messages`. */
interface MessagePage {
  messages: MessageBody[];
  has_more: boolean;
}

describe('Mensagens de uma Conversa (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  /** Uma Pessoa com Sessão num Canal de que ela participa. */
  async function inChannel(): Promise<{ person: TestPerson; token: string; channelId: string }> {
    const person = await createPerson(app);
    const token = await login(app, person);
    const channel = await insertChannel({ participants: [person.id] });
    return { person, token, channelId: channel.id };
  }

  function send(token: string, channelId: string, body: string, clientMessageId: string = randomUUID()) {
    return request(app.getHttpServer())
      .post(`/v1/conversations/${channelId}/messages`)
      .set('Cookie', sessionCookie(token))
      .send({ client_message_id: clientMessageId, body });
  }

  function history(token: string, channelId: string, before?: string) {
    return request(app.getHttpServer())
      .get(`/v1/conversations/${channelId}/messages`)
      .query(before ? { before } : {})
      .set('Cookie', sessionCookie(token));
  }

  it('devolve as Mensagens enviadas na ordem de envio', async () => {
    const { token, channelId } = await inChannel();
    await send(token, channelId, 'primeira').expect(201);
    await send(token, channelId, 'segunda').expect(201);

    const response = await history(token, channelId);

    expect(response.status).toBe(200);
    const page = response.body as MessagePage;
    expect(page.messages.map((m) => m.body)).toEqual(['primeira', 'segunda']);
    expect(page.has_more).toBe(false);
  });

  it('devolve a página mais recente em ordem crescente, com has_more', async () => {
    const { person, token, channelId } = await inChannel();
    await insertMessages(channelId, person.id, 52);

    const response = await history(token, channelId);

    expect(response.status).toBe(200);
    const page = response.body as MessagePage;
    expect(page.messages.map((m) => m.body)).toEqual(
      Array.from({ length: 50 }, (_, i) => String(i + 3)),
    );
    expect(page.has_more).toBe(true);
  });

  it('o before devolve a página anterior, e a última vem com has_more falso', async () => {
    const { person, token, channelId } = await inChannel();
    const ids = await insertMessages(channelId, person.id, 52);

    const response = await history(token, channelId, ids[2]);

    expect(response.status).toBe(200);
    const page = response.body as MessagePage;
    expect(page.messages.map((m) => m.body)).toEqual(['1', '2']);
    expect(page.has_more).toBe(false);
  });

  it('um before malformado responde 400', async () => {
    const { token, channelId } = await inChannel();

    const response = await history(token, channelId, 'nao-e-um-uuid');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
  });

  it('um Canal sem participação responde 404', async () => {
    const { token } = await inChannel();
    const other = await insertChannel();

    const response = await history(token, other.id);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      code: 'not_found',
      detail: 'A conversa não existe ou você não participa dela.',
    });
  });

  it('mostra o nome atual do autor', async () => {
    const { person, token, channelId } = await inChannel();
    await send(token, channelId, 'oi').expect(201);
    await renamePerson(person.id, 'Nome Novo');

    const response = await history(token, channelId);

    expect((response.body as MessagePage).messages[0].author).toEqual({
      id: person.id,
      name: 'Nome Novo',
      username: person.username,
    });
  });

  it('responde 201 com a Mensagem cortada nas pontas e o autor', async () => {
    const { person, token, channelId } = await inChannel();
    const clientMessageId = randomUUID();

    const response = await send(token, channelId, '  oi\n\n', clientMessageId);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      conversation_id: channelId,
      client_message_id: clientMessageId,
      author: { id: person.id, name: person.name, username: person.username },
      body: 'oi',
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });

  it.each([[''], ['   '], [' \n \n ']])('um corpo vazio depois do corte (%j) responde 400', async (body) => {
    const { token, channelId } = await inChannel();

    const response = await send(token, channelId, body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed', errors: [{ field: 'body' }] });
  });

  it('4.000 grafemas passam e 4.001 respondem 400', async () => {
    const { token, channelId } = await inChannel();
    const atLimit = '👩🏽‍💻'.repeat(4000);

    const accepted = await send(token, channelId, atLimit);
    const refused = await send(token, channelId, `${atLimit}a`);

    expect(accepted.status).toBe(201);
    expect(refused.status).toBe(400);
    expect(refused.body).toMatchObject({ code: 'validation_failed', errors: [{ field: 'body' }] });
  });

  it('4.000 grafemas de muitos bytes cabem no limite do corpo', async () => {
    const { token, channelId } = await inChannel();

    // A bandeira da Inglaterra é um grafema só, com 28 bytes em UTF-8: cerca de 112 KB no total.
    const response = await send(token, channelId, '🏴󠁧󠁢󠁥󠁮󠁧󠁿'.repeat(4000));

    expect(response.status).toBe(201);
  });

  it('um client_message_id malformado responde 400', async () => {
    const { token, channelId } = await inChannel();

    const response = await send(token, channelId, 'oi', 'nao-e-um-uuid');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
  });

  it('enviar num Canal sem participação responde 404', async () => {
    const { token } = await inChannel();
    const other = await insertChannel();

    const response = await send(token, other.id, 'oi');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ code: 'not_found' });
  });

  it('o mesmo client_message_id do mesmo autor responde 200 com a Mensagem já gravada', async () => {
    const { token, channelId } = await inChannel();
    const clientMessageId = randomUUID();
    const first = await send(token, channelId, 'primeira tentativa', clientMessageId).expect(201);

    const response = await send(token, channelId, 'corpo diferente', clientMessageId);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(first.body);
    const page = (await history(token, channelId)).body as MessagePage;
    expect(page.messages.map((m) => m.body)).toEqual(['primeira tentativa']);
  });

  it('o mesmo client_message_id de outro autor grava outra Mensagem', async () => {
    const { person, token, channelId } = await inChannel();
    const other = await createPerson(app);
    // Criada depois do Canal, a outra Pessoa já participa dele, como toda conta nova.
    const otherToken = await login(app, other);
    const clientMessageId = randomUUID();
    await send(token, channelId, 'de uma Pessoa', clientMessageId).expect(201);

    const response = await send(otherToken, channelId, 'de outra Pessoa', clientMessageId);

    expect(response.status).toBe(201);
    const page = (await history(token, channelId)).body as MessagePage;
    expect(page.messages.map((m) => [m.author.id, m.body])).toEqual([
      [person.id, 'de uma Pessoa'],
      [other.id, 'de outra Pessoa'],
    ]);
  });
});
