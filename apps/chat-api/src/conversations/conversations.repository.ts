import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { Conversation } from './conversation.entity.js';

/**
 * Chave do lock consultivo que serializa a gravação das participações nos Canais públicos: a
 * criação de conta e a criação de Canal o tomam, para nenhuma Pessoa ficar fora de um Canal criado
 * ao mesmo tempo que ela (spec da F02, "Conversas e participação").
 */
const PUBLIC_CHANNEL_PARTICIPATIONS_LOCK = 2_024_0201;

@Injectable()
export class ConversationsRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get conversations() {
    return this.txHost.tx.getRepository(Conversation);
  }

  /** Os Canais de que a Pessoa participa, em ordem de nome. */
  listChannelsOf(personId: string): Promise<Conversation[]> {
    return this.conversations
      .createQueryBuilder('conversation')
      .innerJoin('participations', 'participation', 'participation.conversation_id = conversation.id')
      .where('participation.person_id = :personId', { personId })
      .andWhere('conversation.type = :type', { type: 'public_channel' })
      .orderBy('conversation.name', 'ASC')
      .getMany();
  }

  /** A Conversa, com o criador, se a Pessoa participa dela; senão, `null`. */
  findParticipatedById(id: string, personId: string): Promise<Conversation | null> {
    return this.conversations
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .innerJoin('participations', 'participation', 'participation.conversation_id = conversation.id')
      .where('conversation.id = :id', { id })
      .andWhere('participation.person_id = :personId', { personId })
      .getOne();
  }

  /** Se a Pessoa participa da Conversa, pela chave primária da participação. */
  async isParticipant(conversationId: string, personId: string): Promise<boolean> {
    const rows: unknown[] = await this.txHost.tx.query(
      'SELECT 1 FROM participations WHERE conversation_id = $1 AND person_id = $2',
      [conversationId, personId],
    );
    return rows.length > 0;
  }

  /** Grava a participação da Pessoa em todos os Canais públicos; o par repetido é ignorado. */
  async joinPublicChannels(personId: string): Promise<void> {
    await this.txHost.tx.query(
      `INSERT INTO participations (conversation_id, person_id)
       SELECT id, $1 FROM conversations WHERE type = 'public_channel'
       ON CONFLICT DO NOTHING`,
      [personId],
    );
  }

  /**
   * Grava o Canal; com o nome já usado, não grava e devolve `false`. O `ON CONFLICT DO NOTHING`
   * deixa a transação de pé, sem o erro da violação do índice único.
   */
  async insertChannel(conversation: Conversation): Promise<boolean> {
    const result = await this.conversations
      .createQueryBuilder()
      .insert()
      .values(conversation)
      .orIgnore()
      .returning('id')
      .execute();
    return (result.raw as unknown[]).length > 0;
  }

  /** Grava a participação de todas as Pessoas na Conversa. */
  async joinAllPeople(conversationId: string): Promise<void> {
    await this.txHost.tx.query(
      `INSERT INTO participations (conversation_id, person_id)
       SELECT $1, id FROM people
       ON CONFLICT DO NOTHING`,
      [conversationId],
    );
  }

  /** Toma o lock das participações nos Canais públicos até o fim da transação atual. */
  async lockPublicChannelParticipations(): Promise<void> {
    await this.txHost.tx.query('SELECT pg_advisory_xact_lock($1)', [PUBLIC_CHANNEL_PARTICIPATIONS_LOCK]);
  }
}
