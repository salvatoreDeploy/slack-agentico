import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Message } from './message.entity.js';

@Injectable()
export class MessagesRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get messages() {
    return this.txHost.tx.getRepository(Message);
  }

  /**
   * As `limit` Mensagens mais recentes da Conversa antes de `before`, com o autor, da mais nova para
   * a mais antiga.
   */
  listNewestFirst(conversationId: string, before: string | undefined, limit: number): Promise<Message[]> {
    const query = this.messages
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.author', 'author')
      .where('message.conversation_id = :conversationId', { conversationId })
      .orderBy('message.id', 'DESC')
      .limit(limit);
    if (before) {
      query.andWhere('message.id < :before', { before });
    }
    return query.getMany();
  }

  /** Grava a Mensagem; as datas que o banco gera voltam na própria entidade, sem nova leitura. */
  async insert(message: Message): Promise<void> {
    await this.messages.insert(message);
  }
}
