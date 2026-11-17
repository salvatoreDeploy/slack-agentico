import { INestApplication } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { PeopleService } from '../../src/people/people.service.js';
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

/** Cria uma Pessoa direto pelo service, com e-mail único e a senha de teste. */
export async function createPerson(
  app: INestApplication<App>,
  overrides: Partial<Pick<TestPerson, 'name' | 'email' | 'password'>> = {},
): Promise<TestPerson> {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? TEST_PASSWORD;
  const person = await app
    .get(ClsService)
    .run(() =>
      app.get(PeopleService).create({ email, name: overrides.name ?? 'Pessoa de Teste', password }),
    );
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

/** O cabeçalho com o cookie de sessão, como o BFF o repassa. */
export function sessionCookie(token: string): string {
  return `session=${token}`;
}

/** Envelhece todas as Sessões da Pessoa até o passado, para o teste de Sessão vencida. */
export async function expireSessions(person: TestPerson): Promise<void> {
  await queryTestDatabase(
    "UPDATE sessions SET expires_at = now() - interval '1 minute' WHERE person_id = $1",
    [person.id],
  );
}
