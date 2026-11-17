import { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { v7 as uuidv7 } from 'uuid';
import { uniqueEmail } from '../../test/support/unique-email.js';
import { ConfigModule } from '../config/config.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PeopleModule } from './people.module.js';
import { PeopleRepository } from './people.repository.js';
import { Person } from './person.entity.js';

function newPerson(email: string): Person {
  const person = new Person();
  person.id = uuidv7();
  person.name = 'Pessoa';
  person.username = `p${person.id.replace(/-/g, '').slice(-12)}`;
  person.email = email;
  person.passwordHash = 'hash';
  return person;
}

describe('PeopleRepository', () => {
  let app: INestApplicationContext;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, DatabaseModule, PeopleModule],
    }).compile();
    app = await moduleRef.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('recusa um segundo registro com o mesmo e-mail', async () => {
    const people = app.get(PeopleRepository);
    const cls = app.get(ClsService);
    const email = uniqueEmail();
    await cls.run(() => people.insert(newPerson(email)));

    const conflict = await cls.run(() => people.insert(newPerson(email)));

    expect(conflict).toBe('email');
  });
});
