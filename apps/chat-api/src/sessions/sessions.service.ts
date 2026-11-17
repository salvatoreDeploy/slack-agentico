import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { PasswordHasher } from '../people/password-hasher.js';
import { PeopleService } from '../people/people.service.js';
import { Person } from '../people/person.entity.js';
import { hashSessionToken, newSessionToken, SESSION_DURATION_MS } from './session-rules.js';
import { Session } from './session.entity.js';
import { InvalidCredentialsError, UnauthenticatedError } from './sessions.errors.js';
import { SessionsRepository } from './sessions.repository.js';

export interface LoginResult {
  token: string;
  person: Person;
}

/** Login e validação da Sessão (LLD, "Estados e regras", seção "Sessão e login"). */
@Injectable()
export class SessionsService {
  constructor(
    private readonly sessions: SessionsRepository,
    private readonly people: PeopleService,
    private readonly passwords: PasswordHasher,
  ) {}

  /**
   * Confere a senha e cria a Sessão. Para e-mail inexistente, confere contra o hash fixo, para o
   * tempo de resposta não revelar se a conta existe.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const person = await this.people.findByEmail(email);
    const valid = person
      ? await this.passwords.verify(person.passwordHash, password)
      : await this.passwords.verifyAgainstDummy(password);
    if (!person || !valid) {
      throw new InvalidCredentialsError();
    }

    const token = newSessionToken();
    const now = new Date();
    const session = new Session();
    session.id = uuidv7();
    session.personId = person.id;
    session.tokenHash = hashSessionToken(token);
    session.lastUsedAt = now;
    session.expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
    await this.sessions.insert(session);
    return { token, person };
  }

  /**
   * A Pessoa da Sessão do token. Token desconhecido ou Sessão vencida respondem igual, e a vencida
   * é apagada nessa hora. A renovação entra com a tarefa F01-T06.
   */
  async authenticate(token: string): Promise<Person> {
    const session = await this.sessions.findByTokenHash(hashSessionToken(token));
    if (!session) {
      throw new UnauthenticatedError();
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.deleteById(session.id);
      throw new UnauthenticatedError();
    }
    const person = await this.people.findById(session.personId);
    if (!person) {
      throw new UnauthenticatedError();
    }
    return person;
  }
}
