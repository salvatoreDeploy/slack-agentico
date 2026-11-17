import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PEOPLE_USERNAME_UNIQUE, Person } from './person.entity.js';

const UNIQUE_VIOLATION = '23505';

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

  findById(id: string): Promise<Person | null> {
    return this.people.findOneBy({ id });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.people.existsBy({ username });
  }

  /** Grava a Pessoa; a única do banco decide os conflitos, inclusive sob concorrência. */
  async insert(person: Person): Promise<PersonConflict> {
    try {
      await this.people.insert(person);
      return null;
    } catch (error) {
      return conflictOf(error);
    }
  }
}

function conflictOf(error: unknown): PersonConflict {
  const driverError =
    error instanceof QueryFailedError
      ? (error.driverError as { code?: string; constraint?: string })
      : undefined;
  if (driverError?.code !== UNIQUE_VIOLATION) {
    throw error;
  }
  return driverError.constraint === PEOPLE_USERNAME_UNIQUE ? 'username' : 'email';
}
