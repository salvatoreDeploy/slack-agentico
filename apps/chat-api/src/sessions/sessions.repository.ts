import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { SESSION_DURATION_MS, SESSION_RENEWAL_INTERVAL_MS } from './session-rules.js';
import { Session } from './session.entity.js';

@Injectable()
export class SessionsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get sessions() {
    return this.txHost.tx.getRepository(Session);
  }

  async insert(session: Session): Promise<void> {
    await this.sessions.insert(session);
  }

  /** A Sessão do token com a Pessoa dela, numa consulta só: é o caminho de toda requisição. */
  findByTokenHashWithPerson(tokenHash: Buffer): Promise<Session | null> {
    return this.sessions.findOne({ where: { tokenHash }, relations: { person: true } });
  }

  async deleteById(id: string): Promise<void> {
    await this.sessions.delete({ id });
  }

  /**
   * Renova a validade se o último uso tem um intervalo de renovação ou mais. A condição fica também
   * no `WHERE`, para duas requisições simultâneas não renovarem duas vezes. Os tempos vêm do
   * `now()` do banco.
   */
  async renew(id: string): Promise<void> {
    await this.txHost.tx.query(
      `UPDATE sessions
       SET last_used_at = now(),
           expires_at = now() + $2::bigint * interval '1 millisecond',
           updated_at = now()
       WHERE id = $1 AND last_used_at <= now() - $3::bigint * interval '1 millisecond'`,
      [id, SESSION_DURATION_MS, SESSION_RENEWAL_INTERVAL_MS],
    );
  }

  /** Apaga as Sessões da Pessoa, menos a de `exceptId`, se houver, e diz quantas apagou. */
  async deleteByPerson(personId: string, exceptId?: string): Promise<number> {
    const result = await this.sessions.delete(
      exceptId ? { personId, id: Not(exceptId) } : { personId },
    );
    return result.affected ?? 0;
  }

  /** Apaga as Sessões vencidas, pelo índice de `expires_at`, e diz quantas eram. */
  async deleteExpired(): Promise<number> {
    const result = await this.sessions
      .createQueryBuilder()
      .delete()
      .where('expires_at <= now()')
      .execute();
    return result.affected ?? 0;
  }
}
