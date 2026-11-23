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

  /**
   * Grava a Mensagem e diz se gravou. A repetição do par (autor, `client_message_id`) não grava nem
   * levanta erro (`ON CONFLICT DO NOTHING`), para não abortar a transação de quem chama. As datas
   * que o banco gera voltam na própria entidade, sem nova leitura.
   */
  async insert(message: Message): Promise<boolean> {
    const result = await this.messages
      .createQueryBuilder()
      .insert()
      .values(message)
      .orIgnore()
      .returning(['createdAt', 'updatedAt'])
      .execute();
    const generated = result.generatedMaps[0] as Partial<Message> | undefined;
    if ((result.raw as unknown[]).length === 0 || !generated) {
      return false;
    }
    Object.assign(message, generated);
    return true;
  }

  /** A Mensagem já gravada pelo autor com o id gerado no cliente, com o autor. */
  findByAuthorAndClientId(authorPersonId: string, clientMessageId: string): Promise<Message> {
    return this.messages.findOneOrFail({
      where: { authorPersonId, clientMessageId },
      relations: { author: true },
    });
  }
}
