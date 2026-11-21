import { TransactionHost } from '@nestjs-cls/transactional';
import { INestApplicationContext } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service.js';
import { NewPerson, PeopleService } from '../people/people.service.js';
import { Person } from '../people/person.entity.js';

/**
 * Cria a conta de uma Pessoa: sob o lock das participações, a Pessoa e a participação dela em
 * todos os Canais públicos, numa transação só (spec da F02, história 7). É o que o `create` do comando de contas chama, e os
 * testes também, para a Pessoa deles nascer como a do Operador. Quem chama abre o contexto do cls.
 */
export function createAccount(app: INestApplicationContext, input: NewPerson): Promise<Person> {
  const conversations = app.get(ConversationsService);
  return app.get(TransactionHost).withTransaction(async () => {
    await conversations.lockPublicChannelParticipations();
    const person = await app.get(PeopleService).create(input);
    await conversations.joinPublicChannels(person.id);
    return person;
  });
}
