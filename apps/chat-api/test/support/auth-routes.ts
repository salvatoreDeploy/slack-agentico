import { INestApplication } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { createAccount } from '../../src/accounts/create-account.js';
import { SESSION_COOKIE } from '../../src/sessions/session-rules.js';
import { queryTestDatabase } from './test-database.js';
import { uniqueEmail } from './unique-email.js';

export const TEST_PASSWORD = 'senha-de-teste-1';

export interface TestPerson {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
}

/**
 * Cria uma Pessoa pela criação de conta, como o Operador, com e-mail único e a senha de teste: ela
 * já participa dos Canais públicos.
 */
export async function createPerson(
  app: INestApplication<App>,
  overrides: Partial<Pick<TestPerson, 'name' | 'email' | 'password'>> = {},
): Promise<TestPerson> {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? TEST_PASSWORD;
  const person = await app
    .get(ClsService)
    .run(() => createAccount(app, { email, name: overrides.name ?? 'Pessoa de Teste', password }));
  return { id: person.id, name: person.name, username: person.username, email, password };
}

/** Entra pela rota e devolve o token; falha sozinho se a entrada não der certo. */
export async function login(app: INestApplication<App>, person: TestPerson): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/v1/sessions')
    .send({ email: person.email, password: person.password })
    .expect(201);
  return (response.body as { token: string }).token;
}

/** Sai pela rota; falha sozinho se a saída não der certo. */
export async function logout(app: INestApplication<App>, token: string): Promise<void> {
  await request(app.getHttpServer())
    .delete('/v1/sessions/current')
    .set('Cookie', sessionCookie(token))
    .expect(204);
}

/** O cabeçalho com o cookie de sessão, como o BFF o repassa. */
export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}`;
}

/**
 * Envelhece todas as Sessões da Pessoa em `byMs`: o `last_used_at` e o `expires_at` recuam juntos,
 * como se o tempo passasse sem uso.
 */
export async function ageSessions(person: TestPerson, byMs: number): Promise<void> {
  await queryTestDatabase(
    `UPDATE sessions
     SET last_used_at = last_used_at - $2::bigint * interval '1 millisecond',
         expires_at = expires_at - $2::bigint * interval '1 millisecond'
     WHERE person_id = $1`,
    [person.id, byMs],
  );
}
