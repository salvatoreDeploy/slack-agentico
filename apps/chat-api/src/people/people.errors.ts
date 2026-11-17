import { DomainError } from '../common/errors/domain.error.js';

/** Já existe uma Pessoa com o e-mail. */
export class EmailTakenError extends DomainError {
  readonly code = 'email_taken';

  constructor() {
    super('Já existe uma conta com este e-mail.');
  }
}

/** Já existe uma Pessoa com o @usuário. */
export class UsernameTakenError extends DomainError {
  readonly code = 'username_taken';

  constructor() {
    super('Este @usuário já está em uso.');
  }
}
