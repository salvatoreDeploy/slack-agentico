import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Message, MESSAGES_AUTHOR_CLIENT_MESSAGE_UNIQUE } from './message.entity.js';

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

  /**
   * Grava a Mensagem e diz se gravou. A repetição do par (autor, `client_message_id`) não grava nem
   * levanta erro (`ON CONFLICT ON CONSTRAINT … DO NOTHING`), para não abortar a transação de quem
   * chama; qualquer outro conflito continua sendo erro. O TypeORM devolve as datas que o banco gera
   * na própria entidade, sem nova leitura.
   */
  async insert(message: Message): Promise<boolean> {
    const { raw } = await this.messages
      .createQueryBuilder()
      .insert()
      .values(message)
      .orUpdate([], MESSAGES_AUTHOR_CLIENT_MESSAGE_UNIQUE)
      .execute();
    return (raw as unknown[]).length > 0;
  }

  /** A Mensagem já gravada pelo autor com o id gerado no cliente, sem o autor, que quem chama tem. */
  findByAuthorAndClientId(authorPersonId: string, clientMessageId: string): Promise<Message> {
    return this.messages.findOneByOrFail({ authorPersonId, clientMessageId });
  }
}
