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
