import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { normalizeEmail } from '../people/people-rules.js';
import { PasswordHasher } from '../people/password-hasher.js';
import { PeopleService } from '../people/people.service.js';
import { Person } from '../people/person.entity.js';
import { hashSessionToken, newSessionToken, SESSION_DURATION_MS } from './session-rules.js';
import { Session } from './session.entity.js';
import { InvalidCredentialsError, UnauthenticatedError } from './sessions.errors.js';
import { LoginAttemptsService } from './login-attempts.service.js';
import { SessionsRepository } from './sessions.repository.js';

export interface LoginResult {
  token: string;
  person: Person;
}

/** A Sessão que o guard aceitou: o id dela e a Pessoa. */
export interface AuthenticatedSession {
  sessionId: string;
  person: Person;
}

/** Login e validação da Sessão (LLD, "Estados e regras", seção "Sessão e login"). */
@Injectable()
export class SessionsService {
  constructor(
    private readonly sessions: SessionsRepository,
    private readonly people: PeopleService,
    private readonly passwords: PasswordHasher,
    private readonly attempts: LoginAttemptsService,
  ) {}

  /**
   * Confere o limite de tentativas e a senha e cria a Sessão (LLD, "Sessão e login", "Login").
   * Para e-mail inexistente, confere contra o hash fixo, para o tempo de resposta não revelar se a
   * conta existe, e conta a falha do mesmo jeito.
   */
  async login(rawEmail: string, password: string): Promise<LoginResult> {
    const email = normalizeEmail(rawEmail);
    await this.attempts.assertNotBlocked(email);

    const person = await this.people.findByEmail(email);
    const valid = person
      ? await this.passwords.verify(person.passwordHash, password)
      : await this.passwords.verifyAgainstDummy(password);
    if (!person || !valid) {
      await this.attempts.registerFailure(email);
      throw new InvalidCredentialsError();
    }

    await this.attempts.clear(email);
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
   * A Sessão do token, com a Pessoa dela. Token desconhecido ou Sessão vencida respondem igual, e
   * a vencida é apagada nessa hora. A renovação entra com a tarefa F01-T06.
   */
  async authenticate(token: string): Promise<AuthenticatedSession> {
    const session = await this.sessions.findByTokenHashWithPerson(hashSessionToken(token));
    if (!session?.person) {
      throw new UnauthenticatedError();
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.deleteById(session.id);
      throw new UnauthenticatedError();
    }
    return { sessionId: session.id, person: session.person };
  }

  /** Sair: apaga a Sessão da requisição; as outras Sessões da Pessoa continuam. */
  async logout(sessionId: string): Promise<void> {
    await this.sessions.deleteById(sessionId);
  }
}
