import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Person } from './person.entity.js';

/** Qual única o banco recusou ao gravar a Pessoa, ou `null` se gravou. */
export type PersonConflict = 'email' | 'username' | null;

@Injectable()
export class PeopleRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get people() {
    return this.txHost.tx.getRepository(Person);
  }

  findByEmail(email: string): Promise<Person | null> {
    return this.people.findOneBy({ email });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.people.existsBy({ username });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.people.update({ id }, { passwordHash });
  }

  /**
   * Grava a Pessoa; as únicas do banco decidem os conflitos, inclusive sob concorrência. O
   * conflito não levanta erro (`ON CONFLICT DO NOTHING`), para não abortar a transação de quem
   * chama e permitir uma nova tentativa dentro dela, como a da criação de conta.
   */
  async insert(person: Person): Promise<PersonConflict> {
    const result = await this.people
      .createQueryBuilder()
      .insert()
      .values(person)
      .orIgnore()
      .returning('id')
      .execute();
    if ((result.raw as unknown[]).length > 0) {
      return null;
    }
    return (await this.people.existsBy({ email: person.email })) ? 'email' : 'username';
  }
}
