import { DomainError } from '../common/errors/domain.error.js';

/** E-mail inexistente ou senha errada; a mesma resposta nos dois casos (LLD, "Sessão e login"). */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'invalid_credentials';

  constructor() {
    super('E-mail ou senha incorretos.');
  }
}

/** Sem cookie, com token desconhecido ou com a Sessão vencida, sem distinguir os casos. */
export class UnauthenticatedError extends DomainError {
  readonly code = 'unauthenticated';

  constructor() {
    super('É preciso entrar para continuar.');
  }
}

/** E-mail bloqueado pelo limite de tentativas; leva os segundos que faltam no `Retry-After`. */
export class TooManyAttemptsError extends DomainError {
  readonly code = 'too_many_attempts';

  constructor(readonly retryAfterSeconds: number) {
    super('Muitas tentativas de entrar. Aguarde alguns minutos e tente de novo.');
  }

  /** Ao menos 1 s: um bloqueio que acaba neste instante ainda recusou este pedido. */
  override get headers(): Record<string, string> {
    return { 'Retry-After': String(Math.max(1, this.retryAfterSeconds)) };
  }
}

/** Na troca de senha, a senha atual não confere; conta como falha do e-mail da Pessoa. */
export class WrongCurrentPasswordError extends DomainError {
  readonly code = 'wrong_current_password';

  constructor() {
    super('A senha atual não confere.');
  }
}

/** Na troca de senha, a senha nova é igual à atual. */
export class PasswordUnchangedError extends DomainError {
  readonly code = 'password_unchanged';

  constructor() {
    super('A senha nova tem de ser diferente da atual.');
  }
}
