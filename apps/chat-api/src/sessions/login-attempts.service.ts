import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { LoginAttemptsRepository } from './login-attempts.repository.js';
import { TooManyAttemptsError } from './sessions.errors.js';

/**
 * O limite de tentativas de login por e-mail normalizado (LLD, "Sessão e login"; ADR 0023). Quem
 * chama já normalizou o e-mail.
 */
@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);

  constructor(private readonly attempts: LoginAttemptsRepository) {}

  /** Com o e-mail bloqueado, lança `TooManyAttemptsError` com os segundos que faltam. */
  async assertNotBlocked(email: string): Promise<void> {
    const retryAfterSeconds = await this.attempts.findRetryAfterSeconds(email);
    if (retryAfterSeconds !== null) {
      throw new TooManyAttemptsError(retryAfterSeconds);
    }
  }

  /**
   * Registra uma falha. Se ela bloqueou o e-mail, ou se outro pedido simultâneo o bloqueou antes,
   * lança `TooManyAttemptsError`; senão, volta, e quem chama responde a falha de costume.
   */
  async registerFailure(email: string): Promise<void> {
    const outcome = await this.attempts.registerFailure(email);
    if (outcome.kind === 'counted') {
      return;
    }
    if (outcome.kind === 'already_blocked') {
      await this.assertNotBlocked(email);
      return;
    }
    // Um aviso por bloqueio, na falha que o causa, com o e-mail como hash (LLD, "Logs").
    this.logger.warn(
      { email_hash: createHash('sha256').update(email).digest('hex') },
      'Login bloqueado por tentativas demais.',
    );
    throw new TooManyAttemptsError(outcome.retryAfterSeconds);
  }

  /** Apaga as falhas do e-mail, depois de um login certo. */
  async clear(email: string): Promise<void> {
    await this.attempts.clear(email);
  }
}
