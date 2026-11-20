import { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { findSessionIds, insertSession } from '../../test/support/session-rows.js';
import { closeTestDatabase } from '../../test/support/test-database.js';
import { uniqueEmail } from '../../test/support/unique-email.js';
import { ConfigModule } from '../config/config.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PeopleService } from '../people/people.service.js';
import { SessionsModule } from './sessions.module.js';
import { SessionsService } from './sessions.service.js';

describe('SessionsService', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, DatabaseModule, SessionsModule],
    }).compile();
    app = await moduleRef.init();
  });

  afterAll(async () => {
    await app.close();
    await closeTestDatabase();
  });

  function run<T>(work: () => Promise<T>): Promise<T> {
    return app.get(ClsService).run(work);
  }

  async function createPersonId(): Promise<string> {
    const person = await run(() =>
      app.get(PeopleService).create({ email: uniqueEmail(), name: 'Pessoa', password: 'senha-segura-1' }),
    );
    return person.id;
  }

  it('apaga todas as Sessões da Pessoa e diz quantas eram', async () => {
    const personId = await createPersonId();
    const otherId = await createPersonId();
    await Promise.all([insertSession(personId), insertSession(personId), insertSession(personId)]);
    const otherSession = await insertSession(otherId);

    const revoked = await run(() => app.get(SessionsService).revokeAll(personId));

    expect(revoked).toBe(3);
    expect(await findSessionIds(personId)).toEqual([]);
    expect(await findSessionIds(otherId)).toEqual([otherSession]);
  });

  it('apaga todas exceto a indicada', async () => {
    const personId = await createPersonId();
    const kept = await insertSession(personId);
    await Promise.all([insertSession(personId), insertSession(personId)]);

    const revoked = await run(() => app.get(SessionsService).revokeAll(personId, { except: kept }));

    expect(revoked).toBe(2);
    expect(await findSessionIds(personId)).toEqual([kept]);
  });
});
