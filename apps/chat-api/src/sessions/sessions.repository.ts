import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
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

  findByTokenHash(tokenHash: Buffer): Promise<Session | null> {
    return this.sessions.findOneBy({ tokenHash });
  }

  async deleteById(id: string): Promise<void> {
    await this.sessions.delete({ id });
  }
}
