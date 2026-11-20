import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { LoginAttempt } from './login-attempt.entity.js';
import { LOGIN_BLOCK_MS, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS } from './session-rules.js';

/** O que uma falha registrada causou. */
export type FailureOutcome =
  | { kind: 'counted' }
  /** Esta falha completou as tentativas e bloqueou o e-mail. */
  | { kind: 'blocked'; retryAfterSeconds: number }
  /** O e-mail já estava bloqueado, e a falha não mexeu na linha. */
  | { kind: 'already_blocked' };

/**
 * Uma linha por e-mail, atualizada numa instrução só (LLD, "Sessão e login", "Registro das
 * falhas"). Os tempos vêm do `now()` do banco.
 */
@Injectable()
export class LoginAttemptsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  /** Os segundos que faltam para o fim do bloqueio, arredondados para cima, ou `null`. */
  async findRetryAfterSeconds(email: string): Promise<number | null> {
    const rows: { retry_after: number }[] = await this.txHost.tx.query(
      `SELECT ceil(extract(epoch FROM blocked_until - now()))::int AS retry_after
       FROM login_attempts WHERE email = $1 AND blocked_until > now()`,
      [email],
    );
    return rows[0]?.retry_after ?? null;
  }

  /**
   * Soma a falha, ou a recomeça em 1 se a janela já passou. Ao chegar ao limite, bloqueia e zera a
   * contagem e a janela. Com o e-mail já bloqueado, o `WHERE` do `ON CONFLICT` não mexe na linha,
   * e nada volta: assim uma falha simultânea não estende o bloqueio.
   */
  async registerFailure(email: string): Promise<FailureOutcome> {
    const rows: { retry_after: number | null }[] = await this.txHost.tx.query(
      `WITH params AS (
         SELECT $2::int AS max_failures,
                $3::bigint * interval '1 millisecond' AS window_length,
                $4::bigint * interval '1 millisecond' AS block_length
       )
       INSERT INTO login_attempts AS a (email, failures, window_started_at, blocked_until)
       VALUES ($1, 1, now(), NULL)
       ON CONFLICT (email) DO UPDATE SET
         failures = CASE
           WHEN a.window_started_at <= now() - (SELECT window_length FROM params) THEN 1
           WHEN a.failures + 1 >= (SELECT max_failures FROM params) THEN 0
           ELSE a.failures + 1 END,
         window_started_at = CASE
           WHEN a.window_started_at <= now() - (SELECT window_length FROM params) THEN now()
           WHEN a.failures + 1 >= (SELECT max_failures FROM params) THEN now()
           ELSE a.window_started_at END,
         blocked_until = CASE
           WHEN a.window_started_at > now() - (SELECT window_length FROM params)
            AND a.failures + 1 >= (SELECT max_failures FROM params)
           THEN now() + (SELECT block_length FROM params)
           ELSE NULL END,
         updated_at = now()
       WHERE a.blocked_until IS NULL OR a.blocked_until <= now()
       RETURNING ceil(extract(epoch FROM a.blocked_until - now()))::int AS retry_after`,
      [email, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS, LOGIN_BLOCK_MS],
    );
    if (rows.length === 0) {
      return { kind: 'already_blocked' };
    }
    const retryAfter = rows[0].retry_after;
    return retryAfter === null ? { kind: 'counted' } : { kind: 'blocked', retryAfterSeconds: retryAfter };
  }

  /** Apaga as falhas do e-mail, depois de um login certo. */
  async clear(email: string): Promise<void> {
    await this.txHost.tx.getRepository(LoginAttempt).delete({ email });
  }
}
